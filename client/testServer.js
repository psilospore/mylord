var path = require('path');
var argv = require('yargs').argv;
var TestEngine = require(argv.module);
var testEngineName = require(argv.module + '/package.json').name;

var testing = false;

function unpause(){
  process.send({ type: 'unpause' });
}

function onSuccess(){
  unpause();
  if(!testing) {
    testing = true;
    
    if (TestEngineName === 'jest') {
      TestEngineName.runCLI({
        config: path.resolve(argv.config)
      }, function (blah) {
        //TODO what is this supposed to be? Get an error otherwise and there's no docs
      }).then(function (result) {
        console.log('Success?', result.success);
        testing = false;
      });
    } else if (TestEngineName === 'karma') {
      new TestEngineName.Server({
        configFile: path.resolve(argv.config),
        colors: true
      }, function(exitCode){
        testing = false;
      }).start();
    } else {
      throw new Error('Missing karma or jest dependency');
    }

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
