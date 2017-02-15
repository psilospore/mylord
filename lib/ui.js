var blessed = require('blessed');
var path = require('path');
var child_process = require('child_process');
var argv = require('yargs').argv;
var buildLogBox = require('./logBox.js');
var buildTitleBox = require('./titleBox.js');

function setupUI(config){
  var {
    port,
    webpackConfig,
    karmaConfig,
    proxy: {
      endpoints,
      server
    },
    apiKey,
    info,
    modules: {
      webpack,
      webpackDevMiddleware,
      webpackHotMiddleware,
      karma
    }
  } = config;

  // Create a screen object.
  var screen = blessed.screen({
    smartCSR: true
  });

  screen.title = 'MyLorde';

  screen.append(buildTitleBox([{
    label: 'node',
    value: process.version.substring(1)
  }, {
    label: 'npm',
    value: child_process.execSync('npm -v')
  }].concat(info || [])));

  var endpointsArg = endpoints.join(' ');

  var children = [{
    file: '../client/webpackDevServer.js',
    args: [
      `--config=${webpackConfig}`,
      `--module=${webpack}`,
      //`--devServerModule=${webpackDevServer}`,
      `--devMiddlewareModule=${webpackDevMiddleware}`,
      `--hotMiddlewareModule=${webpackHotMiddleware}`,
      `--port=${port}`,
      `--apiKey=${apiKey}`,
      `--endpoints=${endpointsArg}`,
      `--proxyUrl=${server}`
    ],
    logBoxConfig: { left: 0, top: 5, height: '100%-5', label: 'Bundle'},
    handler: setupProxyLogs(server)
  }, {
    file: '../client/karmaServer.js',
    args: [`--config=${karmaConfig}`, `--module=${karma}`],
    logBoxConfig: { top: 0, right: 0, height: '50%', label: 'Tests'}
  }].reduce((children, config) => {
    var child = child_process.fork(path.join(__dirname, config.file), config.args, {silent:true});
    var box = buildLogBox(config.logBoxConfig, child);
    screen.append(box);
    config.handler && config.handler(child);
    return children.concat([{
      config: config,
      process: child,
      box
    }]);
  }, []);

  function setupProxyLogs(proxyUrl) {
    return function(childProcess) {
      var proxyLogBox = buildLogBox({
        bottom: 0,
        right: 0,
        height: '50%',
        label: `Proxy {#888-fg}(${proxyUrl}){/#888-fg}`
      });
      childProcess.on('message', mess => {
        if(mess.type === 'proxy') {
          proxyLogBox.pushLine(mess.value);
        }
      });
      screen.append(proxyLogBox);
    };
  }

  var childrenProcesses = children.map(child => child.process);
  childrenProcesses.forEach(process => {
    process.on('message', mess => {
      if(mess.value && mess.value.message === 'build:start'){
        children.forEach(ch => ch.box.setContent(''));
      }
      if(mess.type === 'broadcast') {
        setTimeout(() => {
          childrenProcesses
            .filter(ch => ch !== process)
            .filter(ch => ch.connected)
            .forEach(ch => {
              ch.send(mess);
            });
        });
      }
    });
  });

  // Quit on Escape, q, or Control-C.
  screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    // kill all the children
    childrenProcesses.forEach(child => {
      child.kill();
    });
    return process.exit(0);
  });

  screen.render();
}

module.exports = setupUI;
//
