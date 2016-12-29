var startUI = require('./lib/ui.js');

function MyLordeServer(config){
  this.config = config;
  console.log('got config: ', config);
}

MyLordeServer.prototype.run = function () {
  startUI(this.config);
};

module.exports = MyLordeServer;
