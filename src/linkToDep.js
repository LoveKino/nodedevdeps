'use strict';

let spawnp = require('spawnp');

/**
 * convert module link to module dependency
 */

module.exports = (depMap, dep) => {
    let projects = [];
    for (let name in depMap) {
        projects.push(depMap[name]);
    }

    return Promise.all([projects.map(({
        path, deps = []
    }) => {
        if (deps.includes(dep)) {
            return spawnp('npm i', [dep, '--save'], {
                cwd: path
            });
        }
    })]);
};
