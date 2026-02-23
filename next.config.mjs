/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      dangerouslyAllowSVG: true,
      remotePatterns: [
        {
          protocol: "https",
          hostname: "github-readme-stats-eight-theta.vercel.app",
        },
        {
          protocol: "https",
          hostname: "github-readme-streak-stats.herokuapp.com",
        },
      ],
    },
  };
  
  export default nextConfig;
  