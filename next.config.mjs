/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      dangerouslyAllowSVG: true,
      remotePatterns: [
        {
          protocol: "https",
          hostname: "github-readme-streak-stats.herokuapp.com",
        },
        {
          protocol: "https",
          hostname: "github-readme-stats.vercel.app",
        },
        {
          protocol: "https",
          hostname: "github-readme-stats-eight-theta.vercel.app",
        },
      ],
    },
  };
  
  export default nextConfig;
  