var proxy = require('http-proxy-middleware');
var bodyParser = require('body-parser');
var rightpad = require('right-pad');
var express = require('express');

// webpack config, port
var path = require('path');
var argv = require('yargs').argv;

var WebpackDevMiddleware = require(argv.devMiddlewareModule);
var WebpackHotMiddleware = require(argv.hotMiddlewareModule);
var webpack = require(argv.module);
var webpackConfig = require(path.resolve(argv.config));

var app = express();
var compiler = webpack(webpackConfig);

var contentBase = (webpackConfig.devServer && webpackConfig.devServer.contentBase) || "app";

app.use(WebpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
  contentBase: contentBase,
  stats: { colors: true }
}));

app.use(WebpackHotMiddleware(compiler));

//hmm...
app.get('*', function(req, res) {
  res.sendFile(path.join(contentBase, 'index.html'));
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(argv.port || 9000, "localhost", function(err) {
	if(err) throw new Error("webpack-dev-server", err);
});

var proxyMiddleware = proxy({
  target: argv.proxyUrl,
  changeOrigin: true,
  secure: false, //don't verify the SSL Certs
  headers: {'Authorization': `Bearer ${argv.apiKey}`},
  onProxyRes: function(proxyRes, req, res){
    var reqDuration = new Date() - res._$_initialTime;
    process.send({
      type: 'proxy',
      value: `${formatMethod(req.method)} ${req.url} {#888-fg}(${reqDuration}ms){/#888-fg}`
    });
    if(req.body && Object.keys(req.body).length !== 0) {
      process.send({
        type: 'proxy',
        value: `{#888-fg}${JSON.stringify(req.body, 0, 2)}{/#888-fg}`
      });
    }
  }
});

app.use('/api', (req, res, next) => {
  res._$_initialTime = new Date();
  proxyMiddleware(req, res, next);
});

function formatMethod(method) {
  return `{${colorForMethod(method)}-fg}{bold}${rightpad(method, 7, ' ')}{/bold}{/${colorForMethod(method)}-fg}`;
}

function colorForMethod(method) {
  switch (method) {
    case 'GET': return '#FF00FF';
    case 'POST': return '#7FFFD4';
    case 'PUT': return '#7FFF00';
    case 'DELETE': return '#FA8072';
    case 'OPTIONS': return '#FFFF66';
    default: return '#FFF';
  }
}

// server.close();
