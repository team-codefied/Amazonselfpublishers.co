<?php
// Local dev only (php -S): mimics the production .htaccess so /route serves route.html.
$root = getenv('SITE_ROOT') ?: dirname(__DIR__) . '/site'; // SITE_ROOT lets tests serve an extracted zip
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if ($path !== '/' && substr($path, -1) === '/') { header('Location: ' . rtrim($path, '/'), true, 301); exit; }
if (preg_match('#^/backend/(lib\.php|services\.json|\.env|storage)#', $path)) { http_response_code(403); exit('Forbidden'); }
if (rtrim($path, '/') === '/book-publishing-services') { header('Location: /publishing-services', true, 301); exit; }
if ($path === '/') { readfile($root . '/index.html'); exit; }
if (is_file($root . $path)) return false; // let php -S serve real files (assets, php)
if (is_file($root . $path . '.html')) { header('Content-Type: text/html; charset=utf-8'); readfile($root . $path . '.html'); exit; }
http_response_code(404); header('Content-Type: text/html; charset=utf-8'); readfile($root . '/404.html');
