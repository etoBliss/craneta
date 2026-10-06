import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root. A stray package-lock.json in a parent directory
  // (C:\Users\Admin) makes Turbopack's root inference pick the wrong folder;
  // this anchors it to the project so builds are deterministic.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
