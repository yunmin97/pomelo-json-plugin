var fs = require('fs');
var log4js = require('log4js');
var logger = log4js.getLogger('utils');

var Utils = module.exports;

// invoke a function
Utils.invokeCallback = function (cb) {
    if (!!cb && typeof cb === 'function') {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
};

// load a file async
Utils.loadFile = function (path, cb) {
    fs.readFile(path, function (err, stream) {
        if (err) {
            Utils.invokeCallback(cb, err);
            return;
        }
        var rt = null;
        try {
            rt = JSON.parse(stream);
        } catch (e) {
            logger.error(path);
        }
        Utils.invokeCallback(cb, null, rt);
    });
};

// load a file sync
Utils.loadFileSync = function (path) {
    var stream = fs.readFileSync(path);
    var rt = null;
    try {
        rt = JSON.parse(stream);
    } catch (e) {
        logger.error(path);
    }
    return rt;
};

// read all files from a dir
Utils.readFiles = function (path, fileArr, recursion) {
    var files = fs.readdirSync(path);
    files.forEach(function (itm, index) {
        var stat = fs.statSync(path + itm);
        if (stat.isDirectory()) {
            if (recursion) {
                Utils.readFiles(path + itm + "/", fileArr, recursion);
            }
        } else {
            var obj = {};
            obj.path = path;
            obj.name = itm;
            fileArr.push(obj);
        }
    });
};

