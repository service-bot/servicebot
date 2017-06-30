var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'public/build');
var APP_DIR = path.resolve(__dirname, 'views');
var config = {
    entry: {
        "app" : ['react-hot-loader/patch', APP_DIR + '/index.jsx']
    },
    output: {
        path: BUILD_DIR,
        publicPath: "/build/",
        filename: 'bundle.js'
    },

    devServer: {
        historyApiFallback: true,
        hot: true,
        contentBase: path.resolve(__dirname,'public'),
        inline: true,
        host: 'localhost', // Defaults to `localhost`
        port: 3002, // Defaults to 8080
        proxy: {
            '^/api/**': {
                target: 'http://localhost:3001',
                secure: false
            },
            '^/setup': {
                target: 'http://localhost:3001',
                secure: false
            }
        }
    },

    module : {
        loaders : [
            {
                test : /\.jsx?/,
                include : APP_DIR,
                loader : 'babel'
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            { test: /js[\/\\].+\.(jsx|js)$/,
                loader: 'imports?jQuery=jquery,$=jquery,this=>window'
            }

        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()

        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     }
        // }),
        // new webpack.DefinePlugin({
        //     'process.env': {
        //         NODE_ENV: JSON.stringify('production')
        //     }
        // })

    ]
};


module.exports = config;
