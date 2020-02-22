pomelo-json-plugin

Config data plugin for [Pomelo](https://github.com/NetEase/pomelo) (a fast,scalable,distributed game server framework for [Node.js](https://nodejs.org), it can be used in Pomelo(>=0.7.0)).

pomelo-json-plugin is a config data(.json) plugin for Pomelo. pomelo-json-plugin can watch all config files in the given dir and reload the file automatically and asynchronous when it is modified. 

##Installation

```
npm install pomelo-json-plugin
```

##Usage

```javascript
let plugin = require('pomelo-json-plugin');
// ... ...
// ... ...
// a file loaded callback
let fileLoaded = function (name) {
    // log the file name
    console.log(name);    
};
// ... ...
// all files loaded down callback
let allLoaded = function () {
    // do other things here..
};
// ... ...
// ... ...
app.configure('production|development', function() {
//   ...
  app.use(plugin, {
    watcher: {
      dir: __dirname + '/config/data',
      interval: 3000,
      // onLoaded: fileLoaded    // option
      // onAllLoaded: allLoaded  // option
    }
  });
//   ...
});
// ... ...
// ... ...
let service = app.get('jsonService');
// check if the config exists 
if (!service.has('card')) {
    return;
}
// get config by name if exists
let data = service.get('card');
// ... ...
// ... ...
```
