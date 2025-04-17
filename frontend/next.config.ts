import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'upload.wikimedia.org',
      'image.tmdb.org',
      'via.placeholder.com',
      'm.media-amazon.com',
      'images-na.ssl-images-amazon.com',
      'i.imgur.com',
      'poster.movieposterdb.com',
      'encrypted-tbn3.gstatic.com',
      'encrypted-tbn0.gstatic.com',
      'encrypted-tbn1.gstatic.com',
      'encrypted-tbn2.gstatic.com',
      'lh3.googleusercontent.com',
      'img.youtube.com',
      'images.unsplash.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true, // This bypasses domain restrictions but loses optimization benefits
  },
};

export default nextConfig;
