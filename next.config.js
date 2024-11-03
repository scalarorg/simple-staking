/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    forceSwcTransforms: true,
  },
  webpack: (config, { isServer }) => {
    // Update WASM configuration
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    };

    // Update the rule for WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          wbg: false,
        },
        fallback: {
          fs: false,
          path: false,
          os: false,
          net: false,
          tls: false,
          "source-map-support": false,
          module: false,
          buffer: require.resolve("buffer"),
          process: require.resolve("process/browser"),
          wbg: false,
        },
      };
    }

    config.externals.push("pino-pretty", "encoding");
    return config;
  },
};

module.exports = nextConfig;
