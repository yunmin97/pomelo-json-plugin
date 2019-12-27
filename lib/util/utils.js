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
const logger = require('pomelo-logger').getLogger(__filename);

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

