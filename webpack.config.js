// Подключения плагинов
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin"); //
const { extendDefaultPlugins } = require("svgo"); //
//---------------------------------------------------------------------
const isDev = process.env.Node_ENV === 'development';
const isProd = !isDev;
// Функция оптимизации кода взависимости от обработки
const optimization = () => {
   const config = {
      //splitChunks: {
      //   chunks: 'all'
      //}
   };
   if (isProd) {
      config.minimizer = [
         new CssMinimizerWebpackPlugin(),
         new TerserWebpackPlugin(),
         //-----------------------
         new ImageMinimizerPlugin({
            minimizer: {
               implementation: ImageMinimizerPlugin.imageminMinify,
               options: {
                  plugins: [
                     ["gifsicle", { interlaced: true }],
                     ["jpegtran", { progressive: true }],
                     ["optipng", { optimizationLevel: 5 }],
                     [
                        'svgo',
                        {
                           name: 'preset-default',
                           params: {
                              overrides: {
                                 // customize options
                                 builtinPluginName: {
                                    optionName: 'optionValue',
                                 },
                                 // or disable plugins
                                 anotherBuiltinPlugin: false,
                              },
                           },
                        }
                     ]
                  ]

               }
            }
         })
      ]
   }
   return config;
};
// Функция добавления расширения
const fileName = ext => isDev ? `[name].${ext}` : `[name].${ext}`;
// Функция добавления лоадеров для CSS
const cssLoaders = extra => {
   const loaders = [
      {
         loader: MiniCssExtractPlugin.loader,
      },
      'css-loader'
   ]
   if (extra) {
      loaders.push(extra);
   }
   return loaders;
}

module.exports = {
   context: path.resolve(__dirname, 'src'),
   mode: 'development',
   entry: {
      main: ['@babel/polyfill', './index.ts']
   },
   output: {
      filename: fileName('js'),
      path: path.resolve(__dirname, 'dist')
   },
   resolve: {
      extensions: ['.js', '.css']
   },
   optimization: optimization(),
   devServer: {
      open: true,
      hot: isDev,
      port: 'auto',
      static: {
         directory: './src',
         watch: true
      }
   },
   target: 'web',
   plugins: [
      new HTMLWebpackPlugin({
         template: './index.html',
         minify: {
            collapseWhitespace: isProd
         },
         inject: 'body'
      }),
      new CleanWebpackPlugin(), // Подключение плагина через ключевое слово new
      //new CopyWebpackPlugin({ // Используем плагин для переноса статических файлов
      //   patterns: [
      //      {
      //         from: path.resolve(__dirname, 'src/assets/img'),
      //         to: path.resolve(__dirname, 'dist')
      //      }
      //   ]
      //}),
      new MiniCssExtractPlugin({
         filename: fileName('css')
      })
   ],
   module: {
      rules: [
         {
            test: /\.html$/i,
            loader: 'html-loader'
         },
         {
            test: /\.css$/,
            use: cssLoaders()
         },
         {
            test: /\.s[ac]ss$/,
            use: cssLoaders('sass-loader'),
         },
         {
            test: /\.(png|jpg|jpeg|svg|gif)$/i,
            type: 'asset/resource',
            generator: {
               filename: 'img/[name][ext]'
            }
         },
         {
            test: /\.(ttf|woff|woff2|eot)$/,
            type: 'asset/resource',
            generator: {
               filename: 'fonts/[name][ext]'
            }
         },
         //{
         //   test: /\.js$/,
         //   exclude: /node_modules/, //Убираем папку node__modules из поиска для компиляциии
         //   loader: 'babel-loader',
         //   options: {
         //      presets: [
         //         '@babel/preset-env',
         //      ]
         //   }
         //},

         {
            test: /\.ts$/,
            exclude: /node_modules/, //Убираем папку node__modules из поиска для компиляциии
            loader: 'babel-loader',
            options: {
               presets: [
                  '@babel/preset-env',
                  '@babel/preset-typescript'
               ]
            }
         }
      ],
   }
}