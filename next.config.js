/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['ssh2-sftp-client', 'ssh2'],
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
