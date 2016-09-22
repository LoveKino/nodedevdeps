'use strict';

let {
    getPackageJson, setPackageJson, runSequence
} = require('./util');

let {
    exec
} = require('mz/child_process');

let {
    lstat, realpath
} = require('mz/fs');

let path = require('path');

let log = console && console.log || (() => {}); // eslint-disable-line

/**
 * 1. link all dependencies. `npm link`
 * 2. add dependencies to link_dependencies in package.json
 *
 */
let link = (depMap) => {
    let projects = [];
    for (let name in depMap) {
        projects.push(depMap[name]);
    }

    return runSequence(projects.map((project) => () => linkProject(project, depMap)));
};

let linkProject = (project, depMap) => {
    let projectRoot = project.path;
    let deps = project.deps.map(dep => depMap[dep].path);
    return runSequence(deps.map((depPath) => () => npmLink(projectRoot, depPath)))
        .then(() => {
            return updatePackageDep(projectRoot, deps);
        });
};

let npmLink = (projectRoot, depPath) => {
    /**
     * TODO check cache first
     */
    return getPackageJson(depPath).then((moduleJson) => {
        let nodemodule_depPath = path.join(projectRoot, 'node_modules', moduleJson.name);

        return lstat(nodemodule_depPath).then((stats) => {
            if (stats.isSymbolicLink()) {
                return realpath(nodemodule_depPath).then((real) => {
                    return real === depPath;
                });
            }

            return false;
        }).catch(() => {
            return false;
        }).then((cache) => {
            if (cache) return;
            let linkCmd = `npm link ${depPath}`;
            log(`[npm link] in ${projectRoot}, cmd is ${linkCmd}`);
            return exec(linkCmd, {
                cwd: projectRoot,
                stdio: 'inherit'
            });
        });
    });
};

let updatePackageDep = (projectRoot, list) => {
    return getPackageJson(projectRoot).then((rootJson) => {
        rootJson.link_dependencies = {};

        return Promise.all(list.map((depPath) =>
            getPackageJson(depPath).then((moduleJson) => {
                // tag
                rootJson.link_dependencies[moduleJson.name] = `~${moduleJson.version}`;
            })
        )).then(() => setPackageJson(projectRoot, rootJson));
    });
};

module.exports = {
    link,
    linkProject
};
