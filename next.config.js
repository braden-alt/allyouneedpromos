/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['ssh2-sftp-client', 'ssh2'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const existing = Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean);
      config.externals = [...existing, 'ssh2-sftp-client', 'ssh2'];
    }
    return config;
  },
};

module.exports = nextConfig;
