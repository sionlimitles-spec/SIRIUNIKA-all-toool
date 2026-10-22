/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true, // Wajib untuk static export
  },
};

export default nextConfig;
