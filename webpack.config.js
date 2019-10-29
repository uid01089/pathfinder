const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SshWebpackPlugin = require('ssh-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './webpack.render.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    externals: {
        //electron: 'electron'
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js"]
    },
    //devtool: 'cheap-source-map',
    devtool: 'cheap-module-eval-source-map',
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'Webpack 4 Starter',
            template: './webpack.index.html',
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: false
            }
        }),
        new CopyPlugin([
            { from: './resources/*.png', to: '.', writeToDisk: true },
            { from: './node_modules/leaflet/dist/images/**/', to: '.', writeToDisk: true }
        ]),
        new SshWebpackPlugin({
            host: 'koserver',
            port: '22',
            username: 'pi',
            privateKey: require('fs').readFileSync('/Users/konni/.ssh/id_rsa'),
            before: 'mkdir beforeTest',
            after: 'mkdir afterTest',
            from: './dist',
            to: '/var/www/html/pathfinder',
        })
    ],
    module: {
        rules: [
            {
                test: /\.html$/,
                use: ['text-loader']
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
                loader: 'file-loader'
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: { configFile: "webpack.tsconfig.json" },
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                // We need to transpile Polymer itself and other ES6 code
                // exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        //presets: [[
                        //'@babel/preset-env',
                        //{
                        //    targets: {
                        //        browsers: [
                        // Best practice: https://github.com/babel/babel/issues/7789
                        //            '>=1%',
                        //            'not ie 11',
                        //            'not op_mini all'
                        //        ]
                        //    },
                        //    debug: true
                        // }
                        //]],
                        plugins: [['@babel/plugin-syntax-object-rest-spread', { useBuiltIns: true }]]
                    }
                }
            }
        ],
    },
};