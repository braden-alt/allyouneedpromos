// app/api/test-sanmar-sftp/route.js
// Connectivity test only — lists /SanmarPDD directory, downloads nothing
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  const user = process.env.SANMAR_SFTP_USER;
  const pass = process.env.SANMAR_SFTP_PASS;
  if (!user || !pass) {
    return NextResponse.json({ success: false, error: 'SANMAR_SFTP_USER or SANMAR_SFTP_PASS not set' }, { status: 500 });
  }

  // Dynamically import ssh2-sftp-client (server-only, not bundled for browser)
  let SftpClient;
  try {
    SftpClient = (await import('ssh2-sftp-client')).default;
  } catch (e) {
    return NextResponse.json({ success: false, error: 'ssh2-sftp-client not installed: ' + e.message }, { status: 500 });
  }

  const sftp = new SftpClient();
  try {
    await sftp.connect({
      host: 'ftp.sanmar.com',
      port: 2200,
      username: user,
      password: pass,
      readyTimeout: 15000,
      retries: 1,
    });
    const files = await sftp.list('/SanmarPDD');
    await sftp.end();
    return NextResponse.json({
      success: true,
      host: 'ftp.sanmar.com:2200',
      directory: '/SanmarPDD',
      files: files.map(f => ({ name: f.name, size: f.size, type: f.type, modified: new Date(f.modifyTime).toISOString() })),
    });
  } catch (err) {
    try { await sftp.end(); } catch (_) {}
    const isNetworkBlock = /ECONNREFUSED|ETIMEDOUT|ENOTFOUND/.test(err.message);
    return NextResponse.json({
      success: false,
      host: 'ftp.sanmar.com:2200',
      error: err.message,
      hint: isNetworkBlock
        ? 'Vercel Lambda blocks outbound TCP on port 2200. Use a Railway/Render cron worker for SFTP, or Vercel Cron with a proxy.'
        : 'Check credentials (SANMAR_SFTP_USER / SANMAR_SFTP_PASS) and confirm ftp.sanmar.com port 2200 is reachable.',
    });
  }
}
