'use strict';

let {
    getPackageJson
} = require('./util');

let del = require('del');
let path = require('path');
let promisify = require('promisify-node');
let ncp = promisify(require('ncp'));
let spawnp = require('spawnp');

/**
 * prepublish for module
 *
 * 1. copy project to publish dir
 * 2. install all links for copied project
 */
module.exports = (name, depMap, publishDir) => {
    let project = depMap[name];
    let publicPath = path.join(publishDir, name);
    return del([publicPath]).then(() => {
        // copy
        return ncp(project.path, publicPath);
    }).then(() => {
        return getPackageJson(publicPath).then((moduleJson) => {
            let depMap = moduleJson.link_dependencies;
            let deps = [];
            for (let name in depMap) {
                deps.push(name);
            }

            return Promise.all([deps.map((dep) => {
                return spawnp('npm i', [dep, '--save'], {
                    cwd: publicPath
                });
            })]);
        });
    });
};
