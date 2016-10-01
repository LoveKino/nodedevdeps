'use strict';

let {
    getPackageJson, setPackageJson
} = require('./util');

let spawnp = require('spawnp');

module.exports = (projectPath) => {
    return getPackageJson(projectPath).then((moduleJson) => {
        let depMap = moduleJson.link_dependencies;
        let deps = [];
        for (let name in depMap) {
            deps.push(name);
        }
        delete moduleJson.link_dependencies;
        return setPackageJson(projectPath, moduleJson).then(() => {
            return Promise.all([deps.map((dep) => {
                return spawnp('npm i', [dep, '--save'], {
                    cwd: projectPath
                });
            })]);
        });
    });
};
