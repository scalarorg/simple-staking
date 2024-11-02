/** @type {import('next').NextConfig} */
const webpack = require("webpack");

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    forceSwcTransforms: true,
  },
  webpack: (config) => {
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

    // Update WASM configuration
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
      topLevelAwait: true,
      syncWebAssembly: true,
    };

    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
        process: "process/browser",
      }),
    );

    config.externals.push("pino-pretty", "encoding");
    return config;
  },
};

module.exports = nextConfig;
