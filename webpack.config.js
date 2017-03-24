const path = require('path')
const nodeModulesPath = path.resolve(__dirname, 'node_modules')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: "./src/main",
   output: {
        path: path.join(__dirname, 'public'),
        filename: "app.js"
    },
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
     plugins: [
        new CopyWebpackPlugin([
            {
                from: './src/documentSharePlayground.html',
                to: ''
            },
            {
                from: './src/index.html',
                to: ''
            },
            {
                from: './src/documentSource.html',
                to: ''
            },
            {
                from: './src/styles.css',
                to: ''
            },
             {
                from: './src/lib',
                to: 'lib'
            },
        ]),
    ],
    resolve: {
        extensions: ["", ".ts", ".js"]
    },
    //target: 'node'
    //node: { fs: 'empty' }, target: 'node'
}