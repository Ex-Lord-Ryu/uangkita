<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Kode Reset Password {{ $appName }}</title>
</head>
<body style="margin:0; padding:0; background:#f4f7fb; color:#172033; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb; margin:0; padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; width:100%;">
                    <tr>
                        <td align="center" style="padding:12px 0 24px;">
                            <div style="display:inline-block; border-radius:18px; background:#111827; padding:12px 18px; box-shadow:0 12px 30px rgba(79,70,229,0.22);">
                                <span style="display:inline-block; width:34px; height:34px; border-radius:12px; background:#4f46e5; color:#ffffff; font-size:20px; font-weight:800; line-height:34px; text-align:center; vertical-align:middle;">U</span>
                                <span style="display:inline-block; color:#ffffff; font-size:22px; font-weight:800; letter-spacing:-0.2px; line-height:34px; margin-left:10px; vertical-align:middle;">Uang<span style="color:#a5b4fc;">Ku</span></span>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="border-radius:24px; background:#ffffff; border:1px solid #e5e7eb; box-shadow:0 24px 60px rgba(15,23,42,0.08); overflow:hidden;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="background:#111827; padding:28px 32px;">
                                        <p style="margin:0 0 10px; color:#a5b4fc; font-size:12px; font-weight:800; letter-spacing:3px; text-transform:uppercase;">Kode Reset Password</p>
                                        <h1 style="margin:0; color:#ffffff; font-size:26px; line-height:1.3; font-weight:800;">Pulihkan akses akunmu</h1>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:32px;">
                                        <p style="margin:0 0 18px; color:#172033; font-size:18px; font-weight:800;">Halo {{ $userName ?: 'teman UangKu' }},</p>

                                        <p style="margin:0 0 18px; color:#4b5563; font-size:15px; line-height:1.7;">
                                            Kami menerima permintaan untuk mengatur ulang password akun {{ $appName }} kamu. Masukkan kode berikut di halaman reset password.
                                        </p>

                                        <div style="border-radius:22px; background:#111827; padding:24px; margin:28px 0; text-align:center;">
                                            <p style="margin:0 0 10px; color:#a5b4fc; font-size:12px; font-weight:800; letter-spacing:3px; text-transform:uppercase;">Kode kamu</p>
                                            <p style="margin:0; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:36px; font-weight:800; letter-spacing:10px; line-height:1.2;">{{ $code }}</p>
                                        </div>

                                        <div style="border-radius:18px; background:#eef2ff; border:1px solid #c7d2fe; padding:18px 20px; margin:0 0 22px;">
                                            <p style="margin:0; color:#3730a3; font-size:14px; line-height:1.7;">
                                                Kode ini berlaku selama <strong>{{ $expiresIn }} menit</strong>. Jika kamu tidak meminta reset password, abaikan email ini dan akunmu tetap aman.
                                            </p>
                                        </div>

                                        <p style="margin:0; color:#6b7280; font-size:13px; line-height:1.7;">
                                            Jangan bagikan kode ini kepada siapa pun. Tim {{ $appName }} tidak akan pernah meminta kode reset password kamu.
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="border-top:1px solid #e5e7eb; padding:22px 32px; background:#f9fafb;">
                                        <p style="margin:0; color:#6b7280; font-size:12px; line-height:1.7;">
                                            Email ini dikirim otomatis oleh {{ $appName }}. Butuh bantuan? Hubungi {{ $supportEmail }}.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
