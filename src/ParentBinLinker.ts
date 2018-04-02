import * as fs from 'mz/fs';
import * as path from 'path';
import * as log4js from 'log4js';
import * as link from './link';
import { Options } from './program';
import { FSUtils } from './FSUtils';

export interface Dictionary {
    [name: string]: string;
}

export interface PackageJson {
    name?: string;
    bin?: Dictionary | string;
    devDependencies?: Dictionary;
    dependencies?: Dictionary;
    localDependencies?: Dictionary;
}

export class ParentBinLinker {

    private log: log4js.Logger;

    constructor(private options: Options) {
        this.log = log4js.getLogger('ParentBinLinker');
    }

    private linkBin(binName: string, from: string, childPackage: string): Promise<void> {
        const to = path.join(this.options.childDirectoryRoot, childPackage, 'node_modules', '.bin', binName);
        this.log.debug('Creating link at %s for command at %s', to, from);
        return link.link(from, to)
            .then(() => void 0);
    }

    private linkBinsOfDependencies(childPackages: string[], dependenciesToLink: string[]): Promise<void> {
        if (this.log.isInfoEnabled()) {
            this.log.info(`Linking dependencies ${JSON.stringify(dependenciesToLink)} under children ${JSON.stringify(childPackages)}`);
        }
        return Promise.all(dependenciesToLink.map(dependency => {
            const moduleDir = path.join('node_modules', dependency);
            const packageFile = path.join('node_modules', dependency, 'package.json');
            return fs.readFile(packageFile)
                .then(content => {
                    const pkg: PackageJson = JSON.parse(content.toString());
                    const bin: Dictionary | string = pkg.bin;
                    if (bin) {
                        if (typeof bin === 'string') {
                            return Promise.all(childPackages.map(childPackage =>
                                this.linkBin(pkg.name, path.resolve(moduleDir, bin), childPackage)
                                    .catch(err => this.log.error(`Could not link bin ${bin} for child ${childPackage}.`, err))));
                        } else {
                            return Promise.all(Object.keys(bin).map((binName: string) => Promise.all(childPackages.map(childPackage =>
                                this.linkBin(binName, path.resolve(moduleDir, bin[binName]), childPackage)
                                    .catch(err => this.log.error(`Could not link bin ${binName} for child ${childPackage}.`, err))))));
                        }
                    } else {
                        this.log.debug('Did not find a bin in dependency %s, skipping.', dependency);
                        return Promise.resolve(undefined);
                    }
                })
                .catch(err => this.log.error(`Could not read ${packageFile}`, err))
        })).then(() => void 0);
    }

    public linkBinsToChildren(): Promise<any> {
        return Promise.all([fs.readFile('package.json'), FSUtils.readDirs(this.options.childDirectoryRoot)]).then(results => {
            const contents = results[0];
            const childPackages = results[1];
            const pkg: PackageJson = JSON.parse(contents.toString());
            const allPromises: Promise<void>[] = [];
            if (pkg.devDependencies && this.options.linkDevDependencies) {
                allPromises.push(this.linkBinsOfDependencies(childPackages, Object.keys(pkg.devDependencies)));
            }
            if (pkg.dependencies && this.options.linkDependencies) {
                allPromises.push(this.linkBinsOfDependencies(childPackages, Object.keys(pkg.dependencies)));
            }
            if (pkg.localDependencies && this.options.linkLocalDependencies) {
                allPromises.push(this.linkBinsOfDependencies(childPackages, Object.keys(pkg.localDependencies)));
            }
            return Promise.all(allPromises);
        });
    }
}