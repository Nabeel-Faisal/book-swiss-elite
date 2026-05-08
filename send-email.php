<?php
/**
 * Swiss Elite Chauffeur — Booking Confirmation Mailer
 * SMTP: ssl://smtp.hostinger.com:465
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://book.swisselitetransfers.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data || empty($data['email']) || empty($data['name'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing required fields']);
    exit;
}

/* ── SMTP CONFIG ────────────────────────────────────────── */
const SMTP_HOST      = 'smtp.hostinger.com';
const SMTP_PORT      = 465;
const SMTP_USER      = 'noreply@swisselitetransfers.com';
const SMTP_PASS      = '>R:]xC0c';
const SMTP_FROM      = 'noreply@swisselitetransfers.com';
const SMTP_FROM_NAME = 'Swiss Elite Chauffeur';

/* ── HELPERS ────────────────────────────────────────────── */
function se(mixed $v): string {
    return htmlspecialchars((string)($v ?? ''), ENT_QUOTES | ENT_HTML5, 'UTF-8');
}
function fmtDate(string $d): string {
    if (!$d) return '—';
    $ts = strtotime($d);
    return $ts ? date('d M Y', $ts) : $d;
}
function fmtTime(string $t): string {
    if (!$t) return '—';
    // convert 24h to 12h
    $ts = strtotime("1970-01-01 $t");
    return $ts ? date('h:i A', $ts) : $t;
}
function pill(string $text, string $color = '#C8A45D', string $bg = 'rgba(200,164,93,0.12)', string $border = 'rgba(200,164,93,0.3)'): string {
    return "<span style=\"display:inline-block;background:$bg;border:1px solid $border;border-radius:20px;padding:4px 12px;font-size:11px;font-weight:600;color:$color;letter-spacing:0.05em\">$text</span>";
}
function detailRow(string $label, string $value): string {
    return "
      <tr>
        <td style=\"padding:10px 16px;border-bottom:1px solid rgba(255,255,255,0.05);vertical-align:top\">
          <span style=\"font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#5a5750\">{$label}</span>
        </td>
        <td style=\"padding:10px 16px;border-bottom:1px solid rgba(255,255,255,0.05);vertical-align:top\">
          <span style=\"font-size:13px;font-weight:500;color:#f0ede6\">{$value}</span>
        </td>
      </tr>";
}

/* ── BUILD DATA ─────────────────────────────────────────── */
$ref      = se($data['ref'] ?? 'SE-UNKNOWN');
$name     = se($data['name']);
$email    = $data['email'];
$phone    = se($data['phone'] ?? '—');
$pickup   = se($data['pickup'] ?? '—');
$dropoff  = se($data['dropoff'] ?? '—');
$date     = fmtDate($data['date'] ?? '');
$time     = fmtTime($data['time'] ?? '');
$vehicle  = se($data['vehicle'] ?? '—');
$tripType = ($data['tripType'] ?? '') === 'round-trip' ? 'Round Trip' : 'One Way';
$notes    = se($data['notes'] ?? '');
$dist     = !empty($data['estimatedDistance']) ? '~' . $data['estimatedDistance'] . ' km' : '';
$fare     = !empty($data['estimatedFare'])     ? 'CHF ' . number_format((float)$data['estimatedFare']) : '';
$isRound  = ($data['tripType'] ?? '') === 'round-trip';
$retDate  = !empty($data['returnDate']) ? fmtDate($data['returnDate']) : '';
$retTime  = !empty($data['returnTime']) ? fmtTime($data['returnTime']) : '';
$subject  = "Booking Confirmed — {$ref} | Swiss Elite Chauffeur";

/* ── RETURN ROW ─────────────────────────────────────────── */
$returnRows = '';
if ($isRound && $retDate) {
    $returnRows = detailRow('Return Date', $retDate);
    if ($retTime) $returnRows .= detailRow('Return Time', $retTime);
}

/* ── FARE ROW ───────────────────────────────────────────── */
$fareRows = '';
if ($dist) $fareRows .= detailRow('Est. Distance', $dist);
if ($fare) $fareRows .= detailRow('Estimated Fare', "<strong style=\"color:#C8A45D;font-size:15px\">{$fare}</strong>");

/* ── NOTES BLOCK ────────────────────────────────────────── */
$notesBlock = '';
if ($notes) {
    $notesBlock = "
    <tr>
      <td style=\"padding:0 32px 24px\">
        <div style=\"background:#111;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px 20px\">
          <div style=\"font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C8A45D;margin-bottom:8px\">SPECIAL REQUESTS</div>
          <div style=\"font-size:13px;color:#9e9b93;line-height:1.6\">{$notes}</div>
        </div>
      </td>
    </tr>";
}

/* ── HTML EMAIL ─────────────────────────────────────────── */
$html = <<<HTML
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>Booking Confirmed — {$ref}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#000000;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">

<!-- Pre-header hidden text -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#000000">Your Swiss Elite transfer is confirmed ✓ Booking reference: {$ref} — check inside for full travel details.</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#000000">
<tr><td align="center" style="padding:40px 16px">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%">

    <!-- ── LOGO HEADER ── -->
    <tr>
      <td align="center" style="padding:0 0 36px">
        <div style="font-size:22px;font-weight:700;letter-spacing:5px;color:#ffffff;font-family:Arial,sans-serif">◆ SWISS <span style="color:#C8A45D">ELITE</span></div>
        <div style="font-size:9px;letter-spacing:6px;text-transform:uppercase;color:#5a5750;margin-top:6px;font-family:Arial,sans-serif">LUXURY CHAUFFEUR TRANSFERS</div>
      </td>
    </tr>

    <!-- ── MAIN CARD ── -->
    <tr>
      <td style="background-color:#0d0d0d;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden">

        <!-- Gold top accent line -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="height:1px;background:linear-gradient(90deg,#0d0d0d 0%,#C8A45D 50%,#0d0d0d 100%)"></td>
          </tr>
        </table>

        <!-- ── CONFIRMED BANNER ── -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:1px solid rgba(255,255,255,0.06)">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:rgba(200,164,93,0.09);border:1px solid rgba(200,164,93,0.28);border-radius:12px;padding:20px 24px">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#5a5750;font-family:Arial,sans-serif;margin-bottom:8px">BOOKING REFERENCE</div>
                          <div style="font-size:26px;font-weight:700;color:#C8A45D;letter-spacing:3px;font-family:Arial,sans-serif">{$ref}</div>
                        </td>
                        <td align="right" valign="middle">
                          <div style="display:inline-block;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.3);border-radius:20px;padding:7px 16px">
                            <span style="font-size:11px;font-weight:700;color:#4ade80;letter-spacing:1.5px;font-family:Arial,sans-serif">✓ CONFIRMED</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- ── GREETING ── -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:28px 32px 4px">
              <div style="font-size:20px;font-weight:600;color:#f0ede6;font-family:Arial,sans-serif;margin-bottom:10px">Dear {$name},</div>
              <div style="font-size:14px;color:#9e9b93;line-height:1.7;font-family:Arial,sans-serif">Your luxury transfer reservation has been successfully confirmed. A professional chauffeur will be ready at the pickup location. Please find your complete travel details below.</div>
            </td>
          </tr>
        </table>

        <!-- ── ROUTE VISUAL ── -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:24px 32px">
              <div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#C8A45D;font-family:Arial,sans-serif;margin-bottom:14px">TRANSFER ROUTE</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#111;border:1px solid rgba(255,255,255,0.07);border-radius:12px">
                <tr>
                  <!-- Timeline dots -->
                  <td style="width:40px;padding:20px 0 20px 20px;vertical-align:top" valign="top">
                    <div style="width:11px;height:11px;background:#C8A45D;border-radius:50%;margin-bottom:5px"></div>
                    <div style="width:1px;height:28px;background:rgba(200,164,93,0.35);margin-left:5px"></div>
                    <div style="width:11px;height:11px;background:#C8A45D;border-radius:2px;margin-top:5px"></div>
                  </td>
                  <td style="padding:18px 20px 18px 8px;vertical-align:top" valign="top">
                    <div style="margin-bottom:22px">
                      <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#5a5750;font-family:Arial,sans-serif;margin-bottom:5px">PICKUP</div>
                      <div style="font-size:14px;font-weight:600;color:#f0ede6;font-family:Arial,sans-serif">{$pickup}</div>
                    </div>
                    <div>
                      <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#5a5750;font-family:Arial,sans-serif;margin-bottom:5px">DROP-OFF</div>
                      <div style="font-size:14px;font-weight:600;color:#f0ede6;font-family:Arial,sans-serif">{$dropoff}</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- ── DETAILS TABLE ── -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:0 32px 8px">
              <div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#C8A45D;font-family:Arial,sans-serif;margin-bottom:14px">BOOKING DETAILS</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#111;border:1px solid rgba(255,255,255,0.07);border-radius:12px;overflow:hidden">
HTML;

$html .= detailRow('Passenger Name', $name);
$html .= detailRow('Contact Phone',  $phone);
$html .= detailRow('Vehicle',        $vehicle);
$html .= detailRow('Trip Type',      $tripType);
$html .= detailRow('Pickup Date',    $date);
$html .= detailRow('Pickup Time',    $time);
$html .= $returnRows;
$html .= $fareRows;

$html .= <<<HTML
              </table>
            </td>
          </tr>
        </table>

        <!-- ── NOTES (conditional) ── -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          {$notesBlock}
        </table>

        <!-- ── WHAT TO EXPECT ── -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:16px 32px 28px">
              <div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#C8A45D;font-family:Arial,sans-serif;margin-bottom:14px">WHAT TO EXPECT</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#111;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:4px 0">
                <tr>
                  <td style="padding:12px 20px">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:20px;vertical-align:top;padding-top:2px"><span style="color:#C8A45D;font-size:14px">◆</span></td>
                        <td style="padding-left:10px"><span style="font-size:13px;color:#9e9b93;font-family:Arial,sans-serif;line-height:1.6">Your chauffeur will contact you <strong style="color:#f0ede6">30 minutes before pickup</strong> with their name and vehicle details.</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 20px 12px">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:20px;vertical-align:top;padding-top:2px"><span style="color:#C8A45D;font-size:14px">◆</span></td>
                        <td style="padding-left:10px"><span style="font-size:13px;color:#9e9b93;font-family:Arial,sans-serif;line-height:1.6">For changes or cancellations, contact us at least <strong style="color:#f0ede6">24 hours in advance</strong>.</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 20px 12px">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:20px;vertical-align:top;padding-top:2px"><span style="color:#C8A45D;font-size:14px">◆</span></td>
                        <td style="padding-left:10px"><span style="font-size:13px;color:#9e9b93;font-family:Arial,sans-serif;line-height:1.6">Please keep this email as your booking confirmation. Reference: <strong style="color:#C8A45D">{$ref}</strong></span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- ── CONTACT FOOTER ── -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:rgba(200,164,93,0.07);border-top:1px solid rgba(200,164,93,0.2);padding:20px 32px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="font-size:11px;color:#5a5750;font-family:Arial,sans-serif;margin-bottom:4px">NEED ASSISTANCE?</div>
                    <div style="font-size:13px;color:#9e9b93;font-family:Arial,sans-serif">
                      Email: <a href="mailto:info@swisselitetransfers.com" style="color:#C8A45D;text-decoration:none">info@swisselitetransfers.com</a>
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <div style="font-size:14px;font-weight:700;letter-spacing:3px;color:#ffffff;font-family:Arial,sans-serif">◆ SWISS <span style="color:#C8A45D">ELITE</span></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

      </td>
    </tr>
    <!-- END MAIN CARD -->

    <!-- ── DISCLAIMER ── -->
    <tr>
      <td style="padding:24px 8px 0" align="center">
        <p style="font-size:11px;color:#3a3935;font-family:Arial,sans-serif;line-height:1.6;margin:0;text-align:center">
          This email was sent to {$email} because a booking was made at book.swisselitetransfers.com.<br>
          Swiss Elite Chauffeur · Geneva, Switzerland
        </p>
      </td>
    </tr>

  </table>
</td></tr>
</table>

</body>
</html>
HTML;

/* ── SEND ───────────────────────────────────────────────── */
$error = smtpSend($email, $name, $subject, $html);

if ($error) {
    error_log("[SwissElite Mailer] {$error}");
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $error]);
} else {
    echo json_encode(['ok' => true]);
}

/* ── SMTP FUNCTION ──────────────────────────────────────── */
function smtpSend(string $to, string $toName, string $subject, string $htmlBody): ?string {
    $ctx = stream_context_create([
        'ssl' => [
            'verify_peer'       => false,
            'verify_peer_name'  => false,
            'allow_self_signed' => true,
        ],
    ]);

    $socket = @stream_socket_client(
        'ssl://' . SMTP_HOST . ':' . SMTP_PORT,
        $errno, $errstr, 15,
        STREAM_CLIENT_CONNECT,
        $ctx
    );

    if (!$socket) {
        return "SMTP connect failed ({$errno}): {$errstr}";
    }

    stream_set_timeout($socket, 15);

    $read = static function () use ($socket): string {
        $buf = '';
        while (!feof($socket)) {
            $line = fgets($socket, 512);
            if ($line === false) break;
            $buf .= $line;
            // Multi-line response ends when 4th char is space
            if (strlen($line) >= 4 && $line[3] === ' ') break;
        }
        return $buf;
    };

    $cmd = static function (string $s) use ($socket, $read): string {
        fwrite($socket, $s . "\r\n");
        return $read();
    };

    $read(); // 220 greeting

    $cmd('EHLO ' . (gethostname() ?: 'localhost'));
    $cmd('AUTH LOGIN');
    $cmd(base64_encode(SMTP_USER));
    $auth = $cmd(base64_encode(SMTP_PASS));

    if (strpos($auth, '235') === false) {
        fclose($socket);
        return "SMTP auth failed: {$auth}";
    }

    $cmd('MAIL FROM:<' . SMTP_FROM . '>');
    $cmd("RCPT TO:<{$to}>");
    $cmd('DATA');

    $msgId   = '<' . bin2hex(random_bytes(8)) . '@swisselitetransfers.com>';
    $subj64  = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $toName64 = '=?UTF-8?B?' . base64_encode($toName) . '?=';

    $msg  = "Date: "       . date('r')      . "\r\n";
    $msg .= "From: "       . SMTP_FROM_NAME . " <" . SMTP_FROM . ">\r\n";
    $msg .= "To: {$toName64} <{$to}>\r\n";
    $msg .= "Subject: {$subj64}\r\n";
    $msg .= "Message-ID: {$msgId}\r\n";
    $msg .= "MIME-Version: 1.0\r\n";
    $msg .= "Content-Type: text/html; charset=UTF-8\r\n";
    $msg .= "Content-Transfer-Encoding: base64\r\n";
    $msg .= "\r\n";
    $msg .= chunk_split(base64_encode($htmlBody));
    $msg .= "\r\n.";

    fwrite($socket, $msg . "\r\n");
    $resp = $read();

    $cmd('QUIT');
    fclose($socket);

    return (strpos($resp, '250') !== false) ? null : "DATA response: {$resp}";
}
