<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') json_out(['ok' => false], 405);
json_out(make_token());
