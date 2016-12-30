// webpack config, port
var path = require('path');
var argv = require('yargs').argv;

console.log('Starting Wepack Dev Server...');

var WebpackDevServer = require(argv.devServerModule);
var webpack = require(argv.module);

var webpackConfig = require(path.resolve(argv.config));
var myConfig = Object.create(webpackConfig);
var compiler = webpack(myConfig);

function createApiProxy() {
  return argv.endpoints.split(' ')
    .reduce((config, endpoint) => {
      config[endpoint] = {
        target: argv.proxyUrl,
        changeOrigin: true,
        secure: false,
        headers: {'Authorization': `Bearer ${argv.apiKey}`}
      }
      return config;
    }, {});
}

// setups up messages to be sent to parent with a given message,
// calling handler to modify arguments for message values
const setupMessaging = messageType => handler => arguments => {
  //if this is a child process, process will have a 'send' function
  if(process.send) {
    process.send({
      type: messageType,
      value: handler(arguments)
    });
  }
};

compiler.plugin('compile', setupMessaging('broadcast')((stats) => ({message: 'build:start'})));
// compiler.plugin('invalid', setupMessaging('invalid')(invalidArgs => ({message: 'invalid'})));
compiler.plugin('done', setupMessaging('broadcast')(stats => {
  return {
    message: 'build:done',
    success: stats.compilation.errors.length === 0
  };
}));

var server = new WebpackDevServer(compiler, Object.assign({
  publicPath: myConfig.output.publicPath,

  contentBase: "app",
  // Can also be an array, or: contentBase: "http://localhost/",

  hot: true,
  // Enable special support for Hot Module Replacement
  // Page is no longer updated, but a "webpackHotUpdate" message is sent to the content
  // Use "webpack/hot/dev-server" as additional module in your entry point
  // Note: this does _not_ add the `HotModuleReplacementPlugin` like the CLI option does.

  historyApiFallback: false,
  // Set this as true if you want to access dev server from arbitrary url.
  // This is handy if you are using a html5 router.

  compress: true,
  // Set this if you want to enable gzip compression for assets

  proxy: createApiProxy,
  // Set this if you want webpack-dev-server to delegate a single path to an arbitrary server.
  // Use "**" to proxy all paths to the specified server.
  // This is useful if you want to get rid of 'http://localhost:8080/' in script[src],
  // and has many other use cases (see https://github.com/webpack/webpack-dev-server/pull/127 ).

  setup: function(app) {
    // Here you can access the Express app object and add your own custom middleware to it.
    // For example, to define custom handlers for some paths:
    // app.get('/some/path', function(req, res) {
    //   res.json({ custom: 'response' });
    // });
  },

  // pass [static options](http://expressjs.com/en/4x/api.html#express.static) to inner express server
  staticOptions: {
  },

  clientLogLevel: "info",
  // Control the console log messages shown in the browser when using inline mode. Can be `error`, `warning`, `info` or `none`.

  // webpack-dev-middleware options
  quiet: false,
  noInfo: false,
  filename: "bundle.js",
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  stats: { colors: true }
}, argv.proxy ? {proxy:{ "**": argv.proxy }} : {}));

server.listen(argv.port || 9000, "localhost", function(err) {
	if(err) throw new Error("webpack-dev-server", err);
});
server.app.use((req, res, next) => {
  process.send({
    type: 'proxy',
    value: `{#FF00FF-fg}{bold}${req.method}{/bold}{/#FF00FF-fg} - ${req.url}`
  });
  next();
});

// todo: notify on proxy

// server.close();
