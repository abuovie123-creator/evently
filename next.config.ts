import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    outputFileTracingRoot: __dirname,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    }
};

export default nextConfig;
