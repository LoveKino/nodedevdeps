'use strict';

let {
    getPackageJson, setPackageJson, runSequence
} = require('./util');

let {
    exec
} = require('mz/child_process');

let log = console && console.log || (() => {});// eslint-disable-line

/**
 * 1. link all dependencies. `npm link`
 * 2. add dependencies to link_dependencies in package.json
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
    let linkCmd = `npm link ${depPath}`;
    log(`[npm link] in ${projectRoot}, cmd is ${linkCmd}`);
    return exec(linkCmd, {
        cwd: projectRoot,
        stdio: 'inherit'
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
