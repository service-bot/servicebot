var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'public/build');
var APP_DIR = path.resolve(__dirname, 'views');



var INPUTS_DIR = path.resolve(__dirname, 'input_types');

let glob = require("glob");
let pluginConfig = new Promise((resolve, reject) => {
    glob('./input_types/**/widget.js', (err, files) => {
        let plugins = files.map((file) => {return file.split("/")[2]});
        console.log(plugins);
        resolve(plugins);
    })
})


var config = function(){
    return pluginConfig.then((input_types) => {
        return {
            entry: {
                "bundle": ['react-hot-loader/patch', APP_DIR + '/index.jsx'],
                "widgets": ['react-hot-loader/patch', INPUTS_DIR + '/widgets.js']


            },
            output: {
                path: BUILD_DIR,
                publicPath: "/build/",
                filename: '[name].js'
            },

            devServer: {
                historyApiFallback: true,
                hot: true,
                contentBase: path.resolve(__dirname, 'public'),
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


            externals: {
                servicebot_input_types: JSON.stringify(input_types)
            },


            module: {
                loaders: [
                    {
                        test: /\.jsx?/,
                        include: APP_DIR,
                        loader: 'babel-loader'
                    },
                    {
                        test: /\.jsx?/,
                        include: INPUTS_DIR,
                        loader: 'babel-loader'
                    },
                    {
                        test: /\.css$/,
                        loader: "style-loader!css-loader"
                    },
                    {
                        test: /js[\/\\].+\.(jsx|js)$/,
                        loader: 'imports-loader?jQuery=jquery,$=jquery,this=>window'
                    }

                ]
            },
            plugins: [
                new webpack.HotModuleReplacementPlugin(),
                new webpack.IgnorePlugin(/\.\/getWidgets/),



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
        }
    })
};


module.exports = config;
