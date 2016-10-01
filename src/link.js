'use strict';

let {
    getPackageJson, setPackageJson, runSequence
} = require('./util');

let {
    lstat, realpath
} = require('mz/fs');

let path = require('path');

let spawnp = require('spawnp');

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
    let projectDeps = project.deps || [];
    let deps = projectDeps.map(dep => {
        let depProject = depMap[dep];
        if (!depProject) {
            throw new Error(`missing project ${dep} in depMap ${JSON.stringify(depMap, null, 4)}`);
        }
        return depProject.path;
    });
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
            return spawnp('npm link', [depPath], {
                cwd: projectRoot,
                stdio: 'inherit'
            }).catch(err => {
                log(`cmd is: npm link ${depPath}, in ${projectRoot}`);
                throw err;
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
