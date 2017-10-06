var path = require('path');
var argv = require('yargs').argv;


var Jest = require(argv.module);

var testing = false;

function unpause(){
  process.send({ type: 'unpause' });
}

function onSuccess(){
  unpause();
  if(!testing) {
    testing = true;
    console.log('Running tests...', Jest, 'argv', argv, 'Jest.run', Jest.run);
    Jest.runCLI({
      config: path.resolve(argv.config)
    }, function (blah) {
      //TODO what is this supposed to be? Get an error otherwise and theirs no docs
    }).then(function (result) {
      console.log('Success?', result.success);
      testing = false;
    });
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
