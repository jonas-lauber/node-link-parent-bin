"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("mz/fs");
var path = require("path");
var log4js = require("log4js");
var link = require("./link");
var FSUtils_1 = require("./FSUtils");
var ParentBinLinker = (function () {
    function ParentBinLinker(options) {
        this.options = options;
        this.log = log4js.getLogger('ParentBinLinker');
    }
    ParentBinLinker.prototype.linkBin = function (binName, from, childPackage) {
        var to = path.join(this.options.childDirectoryRoot, childPackage, 'node_modules', '.bin', binName);
        this.log.debug('Creating link at %s for command at %s', to, from);
        return link.link(from, to)
            .then(function () { return void 0; });
    };
    ParentBinLinker.prototype.linkBinsOfDependencies = function (childPackages, dependenciesToLink) {
        var _this = this;
        if (this.log.isInfoEnabled()) {
            this.log.info("Linking dependencies " + JSON.stringify(dependenciesToLink) + " under children " + JSON.stringify(childPackages));
        }
        return Promise.all(dependenciesToLink.map(function (dependency) {
            var moduleDir = path.join('node_modules', dependency);
            var packageFile = path.join('node_modules', dependency, 'package.json');
            return fs.readFile(packageFile)
                .then(function (content) {
                var pkg = JSON.parse(content.toString());
                var bin = pkg.bin;
                if (bin) {
                    if (typeof bin === 'string') {
                        return Promise.all(childPackages.map(function (childPackage) {
                            return _this.linkBin(pkg.name, path.resolve(moduleDir, bin), childPackage)
                                .catch(function (err) { return _this.log.error("Could not link bin " + bin + " for child " + childPackage + ".", err); });
                        }));
                    }
                    else {
                        return Promise.all(Object.keys(bin).map(function (binName) { return Promise.all(childPackages.map(function (childPackage) {
                            return _this.linkBin(binName, path.resolve(moduleDir, bin[binName]), childPackage)
                                .catch(function (err) { return _this.log.error("Could not link bin " + binName + " for child " + childPackage + ".", err); });
                        })); }));
                    }
                }
                else {
                    _this.log.debug('Did not find a bin in dependency %s, skipping.', dependency);
                    return Promise.resolve(undefined);
                }
            })
                .catch(function (err) { return _this.log.error("Could not read " + packageFile, err); });
        })).then(function () { return void 0; });
    };
    ParentBinLinker.prototype.linkBinsToChildren = function () {
        var _this = this;
        return Promise.all([fs.readFile('package.json'), FSUtils_1.FSUtils.readDirs(this.options.childDirectoryRoot)]).then(function (results) {
            var contents = results[0];
            var childPackages = results[1];
            var pkg = JSON.parse(contents.toString());
            var allPromises = [];
            if (pkg.devDependencies && _this.options.linkDevDependencies) {
                allPromises.push(_this.linkBinsOfDependencies(childPackages, Object.keys(pkg.devDependencies)));
            }
            if (pkg.dependencies && _this.options.linkDependencies) {
                allPromises.push(_this.linkBinsOfDependencies(childPackages, Object.keys(pkg.dependencies)));
            }
            if (pkg.localDependencies && _this.options.linkLocalDependencies) {
                allPromises.push(_this.linkBinsOfDependencies(childPackages, Object.keys(pkg.localDependencies)));
            }
            return Promise.all(allPromises);
        });
    };
    return ParentBinLinker;
}());
exports.ParentBinLinker = ParentBinLinker;
//# sourceMappingURL=ParentBinLinker.js.map