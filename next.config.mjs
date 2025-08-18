/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'apricot-worthy-kiwi-289.mypinata.cloud',
        pathname: '/ipfs/**', // Add this
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        pathname: '/ipfs/**', // Add this
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
        pathname: '/ipfs/**', // Add this
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**', // Allows any path from this Google domain
      },
      {
        protocol: 'https',
        hostname: 'chocolate-negative-porcupine-503.mypinata.cloud',
        pathname: '/ipfs/**', // Add this
      },
    ],
  },
};

export default nextConfig;