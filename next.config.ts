import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // verhindert, dass Next wegen eines Lockfiles im Home-Verzeichnis
    // ein falsches Workspace-Root wählt
    root: __dirname,
  },
};

export default nextConfig;
