const fs = require('fs');
const path = require('path');
const util = require('util');
const utils = require('../util/utils');
const EventEmitter = require('events').EventEmitter;
const logger = require('pomelo-logger').getLogger(__filename);

let instance = null;

module.exports = function (app, opts) {
    // singleton
    if (instance) {
        return instance;
    }
    // create component
    instance = new Component(app, opts);
    app.set('jsonService', instance);
    return instance;
};

function fixPath(dir) {
    if (dir &&
        dir.charAt(dir.length - 1) !== '/') {
        dir += '/';
    }
    return dir;
}

let Component = function (app, opts) {
    // todo test...
    logger.error(opts);

    this.app = app;
    // config option
    this.dir = fixPath(opts.dir);
    this.interval = opts.interval || 5000;
    // json table{name=>json}
    this.jsonDataTbl = {};
    // check if dir exist
    if (!fs.existsSync(this.dir)) {
        logger.error('dir %s not exist!', this.dir);
    }
};

util.inherits(Component, EventEmitter);

Component.prototype.start = function (cb) {
    this.loadAll(cb);
};

Component.prototype.stop = function (force, cb) {
    this.jsonDataTbl = null;
    utils.invokeCallback(cb);
};

Component.prototype.loadFileFunc = function (filename, key) {
    utils.loadFile(filename, function (err, data) {
        if (err) {
            logger.error(err);
            return;
        }
        if (data) {
            this.jsonDataTbl[key] = data;
            logger.info("reloaded: " + filename);
        } else {
            logger.error("fail to reloaded: " + filename);
        }
    });
};

Component.prototype.listener4watch = function (filename, key) {
    let self = this;
    return function (curr, prev) {
        if (curr.mtime.getTime() > prev.mtime.getTime()) {
            self.loadFileFunc(filename, key);
        }
    };
};

Component.prototype.loadAll = function (cb) {
    this.jsonDataTbl = {};
    let self = this, files = [];
    utils.readFiles(this.dir, files, true);
    files.forEach(function (file) {
        if (!/\.json$/.test(file.name)) {
            logger.warn('not a json file: ' + file.name);
            return;
        }
        let k_name = file.name.split('.')[0];
        if (self.jsonDataTbl[k_name] !== undefined) {
            logger.warn('duplicate file: ' + file.name);
            return;
        }
        let fullpath = path.join(file.path, file.name);

        // todo test...
        logger.error("loading: " + fullpath);

        let data = utils.loadFileSync(fullpath);
        if (data) {
            self.jsonDataTbl[k_name] = data;
            fs.watchFile(fullpath, {
                persistent: true,
                interval: self.interval
            }, self.listener4watch(fullpath, k_name));
        }
    });
    utils.invokeCallback(cb);
};

Component.prototype.get = function (name) {
    return this.jsonDataTbl[name];
};

