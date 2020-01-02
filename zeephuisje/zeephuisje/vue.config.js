module.exports = {
    publicPath: "./",
    "runtimeCompiler": true,
    chainWebpack: config => {
        config.performance
        .hints(false)
        .maxEntrypointSize(512000000)
        .maxAssetSize(512000000)
    },
}