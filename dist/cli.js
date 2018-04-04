"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ParentBinLinker_1 = require("./ParentBinLinker");
var program_1 = require("./program");
var log4js = require("log4js");
var options = program_1.program.parse(process.argv);
log4js.setGlobalLogLevel(options.logLevel);
new ParentBinLinker_1.ParentBinLinker(options).linkBinsToChildren()
    .catch(function (err) {
    console.error('Error Linking packages', err);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map