pomelo-json-plugin

Config data plugin for Pomelo(a fast,scalable,distributed game server framework for Node.js. http://pomelo.netease.com), it can be used in Pomelo(>=0.7.0).

pomelo-json-plugin is a config data(.json) plugin for Pomelo. pomelo-json-plugin can watch all config files in the given dir and reload the file automatically when it is modified.

##Installation

```
npm install pomelo-json-plugin
```

##Usage

```
var plugin = require('pomelo-json-plugin');
... ...
app.configure('production|development', function() {
  ...
  app.use(plugin, {
    watcher: {
      dir: __dirname + '/config/data',
      interval: 3000
    }
  });
  ...
});
... ...
... ...
var data = app.get('jsonService').get('card');
... ...
... ...
```
