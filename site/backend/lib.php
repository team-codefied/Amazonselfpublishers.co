<?php
// Shared helpers: env loading, signed tokens, rate limiting, SMTP delivery. No external dependencies.
declare(strict_types=1);

function env_load(): array {
    static $env = null;
    if ($env !== null) return $env;
    $env = [];
    $files = [__DIR__ . '/.env', dirname(__DIR__, 2) . '/.env']; // backend/.env, or one level above public_html
    $override = getenv('SITE_ENV_FILE'); // dev/testing only: point at a test env file (e.g. a local fake SMTP)
    if ($override !== false && $override !== '') array_unshift($files, $override);
    foreach ($files as $file) {
        if (is_readable($file)) {
            foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                $line = trim($line);
                if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) continue;
                [$k, $v] = explode('=', $line, 2);
                $v = preg_replace('/\s+#.*$/', '', $v); // strip trailing comments
                $env[trim($k)] = trim(trim($v), "\"'");
            }
            break;
        }
    }
    return $env;
}
function env_get(string $k, string $d = ''): string {
    $e = env_load();
    if (isset($e[$k]) && $e[$k] !== '') return $e[$k];
    $g = getenv($k);
    return ($g !== false && $g !== '') ? (string)$g : $d;
}

function json_out(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function app_secret(): string {
    $s = env_get('APP_SECRET');
    if ($s !== '') return $s;
    $dir = __DIR__ . '/storage';
    if (!is_dir($dir)) @mkdir($dir, 0750, true);
    $f = $dir . '/secret.key'; // auto-generated fallback; folder is denied by .htaccess
    if (!is_file($f)) { @file_put_contents($f, bin2hex(random_bytes(32))); }
    return (string)@file_get_contents($f);
}

function client_ip(): string { return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'; }

function make_token(): array {
    $ts = time();
    return ['token' => hash_hmac('sha256', $ts . '|' . client_ip(), app_secret()), 'ts' => $ts];
}
function check_token(string $token, int $ts): bool {
    if ($ts <= 0 || $token === '') return false;
    return hash_equals(hash_hmac('sha256', $ts . '|' . client_ip(), app_secret()), $token);
}

function rate_limited(string $bucket, int $max, int $window): bool {
    $dir = __DIR__ . '/storage';
    if (!is_dir($dir)) @mkdir($dir, 0750, true);
    $f = $dir . '/rl_' . hash('sha256', $bucket . client_ip()) . '.json';
    $now = time(); $hits = [];
    if (is_file($f)) { $hits = json_decode((string)file_get_contents($f), true) ?: []; }
    $hits = array_values(array_filter($hits, function ($t) use ($now, $window) { return $t > $now - $window; }));
    if (count($hits) >= $max) return true;
    $hits[] = $now;
    @file_put_contents($f, json_encode($hits), LOCK_EX);
    return false;
}

function same_origin(): bool {
    $host = strtolower($_SERVER['HTTP_HOST'] ?? '');
    $allowed = array_filter(array_map('trim', explode(',', strtolower(env_get('ALLOWED_HOSTS')))));
    $allowed[] = $host;
    foreach (['HTTP_ORIGIN', 'HTTP_REFERER'] as $h) {
        if (!empty($_SERVER[$h])) {
            $p = parse_url($_SERVER[$h]);
            $hh = strtolower(($p['host'] ?? '') . (isset($p['port']) ? ':' . $p['port'] : ''));
            return in_array($hh, $allowed, true);
        }
    }
    return false; // browsers send Origin/Referer on form POSTs; reject if neither is present
}

function clean_line(string $s, int $max = 200): string {
    $s = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $s) ?? '';
    return mb_substr(trim($s), 0, $max);
}
function clean_text(string $s, int $max = 3000): string {
    $s = str_replace("\r\n", "\n", $s);
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '';
    return mb_substr(trim($s), 0, $max);
}

/** Minimal SMTP client (SSL on 465, STARTTLS on 587, or none for local testing). Throws RuntimeException on failure. */
function smtp_send(string $to, string $subject, string $body, string $replyTo, string $replyName): void {
    $host = env_get('SMTP_HOST'); $port = (int)env_get('SMTP_PORT', '587');
    $secure = strtolower(env_get('SMTP_SECURE', 'tls')); // ssl | tls | none
    $user = env_get('SMTP_USER'); $pass = env_get('SMTP_PASS');
    $from = env_get('MAIL_FROM', $user); $fromName = env_get('MAIL_FROM_NAME', 'amazonselfpublishers website');
    if ($host === '' || $from === '' || $to === '') throw new RuntimeException('SMTP not configured');

    $remote = ($secure === 'ssl' ? 'ssl://' : 'tcp://') . $host . ':' . $port;
    $ctx = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true]]);
    $fp = @stream_socket_client($remote, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx);
    if (!$fp) throw new RuntimeException('SMTP connect failed: ' . $errstr);
    stream_set_timeout($fp, 20);

    $read = function () use ($fp) {
        $out = '';
        while (($line = fgets($fp, 515)) !== false) { $out .= $line; if (strlen($line) < 4 || $line[3] === ' ') break; }
        return $out;
    };
    $cmd = function ($c, array $ok) use ($fp, $read) {
        if ($c !== '') fwrite($fp, $c . "\r\n");
        $r = $read();
        if (!in_array((int)substr($r, 0, 3), $ok, true)) throw new RuntimeException('SMTP error: ' . trim($r));
        return $r;
    };
    $me = gethostname() ?: 'localhost';

    try {
        $cmd('', [220]);
        $cmd('EHLO ' . $me, [250]);
        if ($secure === 'tls') {
            $cmd('STARTTLS', [220]);
            if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) throw new RuntimeException('STARTTLS failed');
            $cmd('EHLO ' . $me, [250]);
        }
        if ($user !== '') {
            $cmd('AUTH LOGIN', [334]);
            $cmd(base64_encode($user), [334]);
            $cmd(base64_encode($pass), [235]);
        }
        $cmd('MAIL FROM:<' . $from . '>', [250]);
        $cmd('RCPT TO:<' . $to . '>', [250, 251]);
        $cmd('DATA', [354]);
        $enc = function ($s) { return '=?UTF-8?B?' . base64_encode($s) . '?='; };
        $hostName = parse_url('http://' . ($_SERVER['HTTP_HOST'] ?? 'localhost'), PHP_URL_HOST) ?: 'localhost';
        $headers = [
            'Date: ' . date('r'),
            'From: ' . $enc($fromName) . ' <' . $from . '>',
            'To: <' . $to . '>',
            'Reply-To: ' . $enc($replyName) . ' <' . $replyTo . '>',
            'Subject: ' . $enc($subject),
            'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . $hostName . '>',
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: base64',
        ];
        $data = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($body), 76, "\r\n");
        fwrite($fp, $data . "\r\n.\r\n"); // base64 body can never contain a lone dot line
        $r = $read();
        if ((int)substr($r, 0, 3) !== 250) throw new RuntimeException('SMTP rejected message: ' . trim($r));
        $cmd('QUIT', [221]);
    } finally {
        if (is_resource($fp)) fclose($fp);
    }
}
