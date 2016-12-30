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
      webpackDevServer,
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
    args: [`--config=${webpackConfig}`, `--module=${webpack}`, `--devServerModule=${webpackDevServer}`,`--port=${port}`, `--apiKey=${apiKey}`, `--endpoints=${endpointsArg}`],
    logBoxConfig: { left: 0, top: 5, height: '100%-5'},
    handler: setupProxyLogs
  }, {
    file: '../client/karmaServer.js',
    args: [`--config=${karmaConfig}`, `--module=${karma}`],
    logBoxConfig: { right: 0 }
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

  function setupProxyLogs(childProcess) {
    childProcess.on('message', mess => {
      if(mess.type === 'proxy') {
        console.log('woot, woot: got proxy log: ', mess);
      }
    });
  }
  var childrenProcesses = children.map(child => child.process);
  childrenProcesses.forEach(process => {
    process.on('message', mess => {
      if(mess.type === 'broadcast') {
        childrenProcesses.filter(ch => ch !== process).forEach(ch => {
          ch.send(mess);
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
