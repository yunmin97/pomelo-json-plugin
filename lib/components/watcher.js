// MIT License
//
// Copyright(c) 2019 yunmin
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// 	The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// 	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// 	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// 	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

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
    this.app = app;
    // config option
    this.dir = fixPath(opts.dir);
    this.interval = opts.interval || 5000;
    // json table{name=>json}
    this.jsonDataTbl = {};
    // the file is loaded
    this.onLoaded = opts.onLoaded;
    // all loaded up
    this.onAllLoaded = opts.onAllLoaded;
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
    let self = this;
    utils.loadFile(filename, function (err, data) {
        if (err) {
            logger.error(err);
            return;
        }
        if (data) {
            self.jsonDataTbl[key] = data;
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
    let files = [];
    let self = this;
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
        let data = utils.loadFileSync(fullpath);
        if (data) {
            self.jsonDataTbl[k_name] = data;
            fs.watchFile(fullpath, {
                persistent: true,
                interval: self.interval
            }, self.listener4watch(fullpath, k_name));
            utils.invokeCallback(self.onLoaded, k_name);
        }
    });
    utils.invokeCallback(this.onAllLoaded);
    utils.invokeCallback(cb);
};

Component.prototype.get = function (name) {
    return this.jsonDataTbl[name];
};

Component.prototype.has = function (name) {
    return this.jsonDataTbl[name] !== undefined;
};

