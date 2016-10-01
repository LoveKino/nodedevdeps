'use strict';

let del = require('del');

let {
    getPackageJson, setPackageJson
} = require('./util');

let path = require('path');

let log = console && console.log || (() => {}); // eslint-disable-line

/**
 * delete all links
 */
let cleanLink = (depMap) => {
    let projects = [];
    for (let name in depMap) {
        projects.push(depMap[name]);
    }

    return Promise.all(projects.map(cleanProjectLink));
};

let cleanProjectLink = (project) => {
    let projectRoot = project.path;
    let projectDeps = project.deps || [];
    // delete all deps
    // remove link_dependencies from package.json
    return getPackageJson(projectRoot).then((moduleJson) => {
        moduleJson.link_dependencies = {};
        return setPackageJson(projectRoot, moduleJson);
    }).then(() => {
        // module in node_modules
        return del(projectDeps.map((name) => {
            let nodemodule_depPath = path.join(projectRoot, 'node_modules', name);
            log(`delete module ${nodemodule_depPath}`);
            return nodemodule_depPath;
        }), {
            force: true
        });
    });

};

module.exports = {
    cleanLink,
    cleanProjectLink
};
