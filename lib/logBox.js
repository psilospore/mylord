var blessed = require('blessed');

// Helper method to build a base MyLorde log box.
// Pass a blessed box configuration
// to override the default config for a MyLorde Box
// If childProcess is supplied, this method will connect the console output
// from that child process to this box.
function buildLogBox(opts, childProcess){
  var box = blessed.log(Object.assign({
    top: 0,
    width: '50%',
    height: '100%',
    tags: true,
    scrollable: true,
    mouse:true,
    keys:true,
    border: {
      type: 'line'
    },
    style: {
      fg: '#777777',
      border: {
        fg: '#777777'
      }
    },
    scrollbar: {
      ch: ' ',
      inverse: true
    }
  }, opts));

  if(childProcess){
    childProcess.stdout.on('data', function(chunk){
      box.pushLine(chunk.toString('utf8'));
    });
    childProcess.stderr.on('data', function(chunk){
      box.pushLine('{red-fg}' + chunk.toString('utf8') + '{/red-fg}');
    });
    childProcess.on('exit', function(code, signal){
      box.pushLine("Process exited with status " + code);
    });
  }
  return box;
}

module.exports = buildLogBox;
