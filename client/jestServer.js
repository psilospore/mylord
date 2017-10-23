var path = require('path');
var argv = require('yargs').argv;

var child_process = require('child_process');

var testing = false;

function unpause(){
  process.send({ type: 'unpause' });
}

function onSuccess(){
  unpause();
  if(!testing) {
    testing = true;
    // console.log('Running tests...', Jest, 'argv', argv, 'Jest.run', Jest.run);
    var p = child_process.exec('npm run jest');
    p.stdout.pipe(process.stdout);
    // Not sure why passing tests are coming out of stderr seems to happen with Jest.runCLI as well
    p.stderr.pipe(process.stdout);
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
