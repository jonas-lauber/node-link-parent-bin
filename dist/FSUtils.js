"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mkdirp = require("mkdirp");
var fs = require("mz/fs");
var path = require("path");
var FSUtils = (function () {
    function FSUtils() {
    }
    FSUtils.mkdirp = function (dir) {
        return new Promise(function (res, rej) {
            mkdirp(dir, function (err) {
                if (err) {
                    rej(err);
                }
                else {
                    res();
                }
            });
        });
    };
    FSUtils.readDirs = function (location) {
        return fs.readdir(location)
            .then(function (files) { return Promise.all(files.map(function (file) { return fs.stat(path.resolve(location, file)).then(function (stat) { return ({ file: file, stat: stat }); }); }))
            .then(function (files) { return files.filter(function (f) { return f.stat.isDirectory(); }).map(function (f) { return f.file; }); }); });
    };
    return FSUtils;
}());
exports.FSUtils = FSUtils;
;
//# sourceMappingURL=FSUtils.js.map