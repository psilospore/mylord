var path = require('path');
var argv = require('yargs').argv;


var Karma = require(argv.module);

var testing = false;

function unpause(){
  process.send({ type: 'unpause' });
}

function onSuccess(){
  unpause();
  if(!testing) {
    testing = true;
    console.log('Running tests...');
    new Karma.Server({
      configFile: path.resolve(argv.config),
      colors: true
    }, function(exitCode){
      testing = false;
    }).start();
  } else {
    //todo: how to cancel?
  }
}

function onInvalid() {
  unpause();
}

function onStart() {
  process.send({
    type: 'pause',
    value: 'Waiting for build...'
  });
}

process.on('message', message => {
  if(message.value.message === 'build:done' && message.value.success === true){
    onSuccess();
  } else if(message.value.message === 'build:done') {
    onInvalid();
  } else {
    onStart();
  }
});
