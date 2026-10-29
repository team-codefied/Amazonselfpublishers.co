<?php
// Dev-only: sends one test email through the configured SMTP account. Usage: php tools/smtp-test.php
require __DIR__ . '/../site/backend/lib.php';
echo 'openssl: ' . (extension_loaded('openssl') ? 'yes' : 'NO') . PHP_EOL;
try {
    smtp_send(env_get('MAIL_TO'), 'SMTP test from website build', "This is a test message confirming the website's SMTP settings work.\nSent: " . date('c'), env_get('MAIL_FROM'), 'Website test');
    echo "SENT OK\n";
} catch (Throwable $e) {
    echo 'FAILED: ' . $e->getMessage() . "\n";
}
