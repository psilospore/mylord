var proxy = require('http-proxy-middleware');
var bodyParser = require('body-parser');
var rightpad = require('right-pad');
var express = require('express');
var cookieParser = require('cookie-parser');

// webpack config, port
var path = require('path');
var argv = require('yargs').argv;

var WebpackDevMiddleware = require(argv.devMiddlewareModule);
var WebpackHotMiddleware = require(argv.hotMiddlewareModule);
var webpack = require(argv.module);
var webpackConfig = require(path.resolve(argv.config));

var app = express();
var compiler = webpack(webpackConfig);

app.use(cookieParser());

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

var contentBase = (webpackConfig.devServer && webpackConfig.devServer.contentBase) || "app";

app.use(WebpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
  contentBase: contentBase,
  stats: { colors: true }
}));

app.use(WebpackHotMiddleware(compiler));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, ''));

//hmm...
app.get('/', function(req, res) {
  if(req.cookies.UG){
    res.sendFile(path.join(contentBase, 'index.html'));
  } else {
    res.redirect('/login');
  }
});

app.get('/login', function(req, res) {
  res.render('login', { proxy: argv.proxyUrl });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(argv.port || 9000, "localhost", function(err) {
	if(err) throw new Error("webpack-dev-server", err);
});

const replaceAll = (str, search, replacement) => (
  str.replace(new RegExp(search, 'g'), replacement)
);

var proxyMiddleware = proxy({
  target: argv.proxyUrl,
  changeOrigin: true,
  secure: false, //don't verify the SSL Certs
  cookieDomainRewrite: true,
  onProxyRes: function(proxyRes, req, res){

    var reqDuration = new Date() - res._$_initialTime;
    process.send({
      type: 'proxy',
      value: `${formatMethod(req.method)} ${req.url} {#888-fg}(${reqDuration}ms){/#888-fg}`
    });

    if(proxyRes.headers['set-cookie']){
        proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(header => replaceAll(header, 'Secure; ', ''));
    }

    if(req.body && Object.keys(req.body).length !== 0) {
      process.send({
        type: 'proxy',
        value: `{#888-fg}${JSON.stringify(req.body, 0, 2)}{/#888-fg}`
      });
    }
  },
  onProxyReq: function(proxyReq, req, res) {
    if (req.method == "POST" && req.body) {
      proxyReq.write(JSON.stringify(req.body));
      proxyReq.end();
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
