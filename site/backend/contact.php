<?php
// Inquiry endpoint: validates server-side, then delivers by SMTP. Reports success only if SMTP accepted the message.
declare(strict_types=1);
require __DIR__ . '/lib.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_out(['ok' => false, 'message' => 'Method not allowed.'], 405);
if (!same_origin()) json_out(['ok' => false, 'message' => 'Request origin not allowed.'], 403);

$services = json_decode((string)@file_get_contents(__DIR__ . '/services.json'), true) ?: [];
$services['not-sure'] = 'Not sure yet';

// Honeypot: pretend success so bots learn nothing.
if (!empty($_POST['website'])) json_out(['ok' => true, 'message' => 'Thank you. We will be in touch shortly.']);

// CSRF / timing token
$ts = (int)($_POST['form_ts'] ?? 0);
if (!check_token((string)($_POST['csrf_token'] ?? ''), $ts)) json_out(['ok' => false, 'message' => 'Your session expired. Please refresh the page and try again.'], 400);
$age = time() - $ts;
if ($age < 3) json_out(['ok' => false, 'message' => 'That was very fast. Please check your details and try again.'], 429);
if ($age > 7200) json_out(['ok' => false, 'message' => 'Your session expired. Please refresh the page and try again.'], 400);

if (rate_limited('contact', max(1, (int)env_get('RATE_LIMIT_MAX', '5')), 3600)) json_out(['ok' => false, 'message' => 'Too many requests. Please try again later or call us.'], 429);

$name = clean_line((string)($_POST['name'] ?? ''), 100);
$email = clean_line((string)($_POST['email'] ?? ''), 150);
$phone = clean_line((string)($_POST['phone'] ?? ''), 30);
$service = clean_line((string)($_POST['service'] ?? ''), 80);
$title = clean_line((string)($_POST['book_title'] ?? ''), 150);
$status = clean_line((string)($_POST['manuscript_status'] ?? ''), 60);
$msg = clean_text((string)($_POST['message'] ?? ''));
$source = clean_line((string)($_POST['form_source'] ?? ''), 60);

$errors = [];
if (mb_strlen($name) < 2) $errors['name'] = 'Please enter your full name.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Please enter a valid email address.';
// Only name, email and phone are mandatory. Service, message and the disclaimer checkbox are optional.
$digits = strlen(preg_replace('/\D/', '', $phone));
if ($phone === '') $errors['phone'] = 'Please enter your phone number.';
elseif (!preg_match('/^[0-9+()\-.\s]{7,30}$/', $phone) || $digits < 7 || $digits > 15) $errors['phone'] = 'Please enter a valid phone number (7 to 15 digits).';
if ($service !== '' && !isset($services[$service])) $errors['service'] = 'Please choose a valid service.';
// The privacy/terms acknowledgement must be ticked by the visitor (the box is unticked by default).
if (($_POST['consent'] ?? '') !== 'yes') $errors['consent'] = 'Please tick the box to continue.';
$disclaimer = 'ticked';
if ($errors) json_out(['ok' => false, 'message' => 'Please correct the highlighted fields.', 'errors' => $errors], 422);

$serviceLabel = $service !== '' ? $services[$service] : 'Not specified';
$to = env_get('MAIL_TO');
$lines = [
    'New website inquiry', str_repeat('-', 40),
    'Name: ' . $name, 'Email: ' . $email, 'Phone: ' . ($phone ?: '-'),
    'Service: ' . $serviceLabel, 'Book title: ' . ($title ?: '-'), 'Manuscript status: ' . ($status ?: '-'),
    '', 'Message:', ($msg ?: '-'), '', str_repeat('-', 40),
    'Privacy and terms acknowledged: ' . $disclaimer, 'Form: ' . $source, 'Page: ' . clean_line((string)($_POST['page_url'] ?? ''), 300),
];
foreach (['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'referrer'] as $k) {
    $v = clean_line((string)($_POST[$k] ?? ''), 300);
    if ($v !== '') $lines[] = ucfirst($k) . ': ' . $v;
}
$lines[] = 'Received: ' . date('Y-m-d H:i:s T');

try {
    smtp_send($to, 'New inquiry: ' . $serviceLabel . ' (' . $name . ')', implode("\n", $lines), $email, $name);
} catch (Throwable $e) {
    error_log('[amazonselfpublishers] mail failure: ' . $e->getMessage()); // no personal data is logged
    json_out(['ok' => false, 'message' => 'We could not send your message right now. Please call us on ' . env_get('PHONE_DISPLAY', '+1 323 509 3062') . '.'], 502);
}
json_out(['ok' => true, 'message' => 'Thank you. We have received your inquiry and will be in touch shortly.']);
