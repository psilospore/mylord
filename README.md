
![myLorde screenshot](/screen.jpg?raw=true "myLorde in action")

Use like:

    var server = new MyLordeServer({
      port: 9000,
      webpackConfig: './webpack.config.js',
      karmaConfig: './karma.conf.js',
      apiKey: 'woot?',
      proxy: {
        endpoints: ['/api/*'],
        server: 'https://httpbin.org'
      },
      info: [{
        label: 'webpack',
        value: webpackPackageJson.version
      },{
        label: 'karma',
        value: karma.VERSION
      }],
      modules: {
        karma: mod('karma'),
        webpack: mod('webpack'),
        webpackDevServer: mod('webpack-dev-server')
      }
    });

    server.run();
