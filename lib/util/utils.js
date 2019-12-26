const fs = require('fs');
const log4js = require('log4js');
const logger = log4js.getLogger('utils');

let Utils = module.exports;

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
        let rt = null;
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
    let stream = fs.readFileSync(path);
    let rt = null;
    try {
        rt = JSON.parse(stream);
    } catch (e) {
        logger.error(path);
    }
    return rt;
};

// read all files from a dir
Utils.readFiles = function (path, fileArr, recursion) {
    let files = fs.readdirSync(path);
    files.forEach(function (itm, index) {
        let stat = fs.statSync(path + itm);
        if (stat.isDirectory()) {
            if (recursion) {
                Utils.readFiles(path + itm + "/", fileArr, recursion);
            }
        } else {
            let obj = {};
            obj.path = path;
            obj.name = itm;
            fileArr.push(obj);
        }
    });
};

