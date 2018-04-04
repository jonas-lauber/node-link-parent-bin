"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commander = require("commander");
var parseBoolean = function (val) { return val.toLowerCase() === 'true'; };
var describeLinking = function (name, defaultValue) { return "Enables linking of parents `" + name + "`. Defaults to: " + defaultValue; };
exports.program = {
    parse: function (argv) {
        return commander
            .usage('[options]')
            .version(require('../package.json').version)
            .option('-c, --child-directory-root <child-directory>', 'The directory that hosts the child packages relative to the parent root.', 'packages')
            .option('-d, --link-dev-dependencies <true|false>', describeLinking('devDependencies', true), parseBoolean, true)
            .option('-s, --link-dependencies <true|false>', describeLinking('dependencies', false), parseBoolean, false)
            .option('-o, --link-local-dependencies <true|false>', describeLinking('localDependencies', false), parseBoolean, false)
            .option('-l, --log-level <debug|info|error>', 'Set the log level', /debug|info|error/, 'info')
            .parse(argv);
    }
};
//# sourceMappingURL=program.js.map