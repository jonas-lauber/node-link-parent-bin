"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var os_1 = require("os");
var path = require("path");
var log4js_1 = require("log4js");
var fs = require("mz/fs");
var FSUtils_1 = require("./FSUtils");
var cmdShim = require('cmd-shim');
function symlink(from, to) {
    to = path.resolve(to);
    var toDir = path.dirname(to);
    var target = path.relative(toDir, from);
    return FSUtils_1.FSUtils.mkdirp(path.dirname(to))
        .then(function () { return fs.symlink(target, to, 'junction'); });
}
function link(from, to) {
    if (os_1.platform() === 'win32') {
        return cmdShimIfExists(from, to);
    }
    else {
        return linkIfExists(from, to);
    }
}
exports.link = link;
function cmdShimIfExists(from, to) {
    return new Promise(function (res, rej) {
        cmdShim.ifExists(from, to, function (err) {
            if (err) {
                rej(err);
            }
            else {
                res(undefined);
            }
        });
    });
}
function linkIfExists(from, to) {
    return symlink(from, to)
        .catch((function (error) { return handleSymlinkError(error, from, to); }));
}
function handleSymlinkError(error, from, to) {
    return fs.readlink(to)
        .then(function (fromOnDisk) {
        var toDir = path.dirname(to);
        var absoluteFrom = path.resolve(toDir, from);
        var absoluteFromOnDisk = path.resolve(toDir, fromOnDisk);
        if (absoluteFrom === absoluteFromOnDisk) {
            // if the link already exists and matches what we would do,
            // we don't need to do anything
            return undefined;
        }
        else {
            info("Different link at '" + to + "' already exists. Leaving it alone, the package is probably already installed in the child package.");
        }
    })
        .catch(function () {
        // this is not an handled exception, let's throw original error
        throw error;
    });
}
function info(message) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var log = log4js_1.getLogger('link');
    log.info.apply(log, [message].concat(args));
}
//# sourceMappingURL=link.js.map