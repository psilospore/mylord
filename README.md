
# MyLord
![myLorde screenshot](/screen.jpg?raw=true "myLorde in action")

## Configuration

```
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
```

### Jest
If you choose to use jest instead then structure your package.json in a similar manager:

```
  "scripts": {
    ...
    "jest": "jest --colors --notify --config config/jest.conf.js"
  }
  "jest": {
    "colors": true,
    "verbose": true,
    "testRegex": ".*.spec.js$"
  },
```