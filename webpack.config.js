const path = require('path')
const nodeModulesPath = path.resolve(__dirname, 'node_modules')
module.exports = {
    entry: "./src/main",
    output: { filename: "app.js" },
    devtool: 'source-map',
    module: {
        loaders: [
            {
                test: /\.js$/, // All .js files
                loaders: ['babel-loader'],
                exclude: [nodeModulesPath]
            },
            {
                test: /.ts$/,
                loader: "ts-loader"
            },
            {
                test: /\.css$/,
                loader: 'style!' + 'css?sourceMap'
            },
            {
                test: /\.scss$/,
                loader: 'style!' + 'css?sourceMap' + '!sass?sourceMap'
            }
        ]
    },
    resolve: {
        extensions: ["", ".ts", ".js"]
    },
    //target: 'node'
    //node: { fs: 'empty' }, target: 'node'
}