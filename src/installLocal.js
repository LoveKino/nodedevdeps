'use strict';

let {
    runSequence, installModule, removeModule
} = require('./util');

let installDepLocal = (name, depMap, {
    cacheMap = {}
} = {}) => {
    if (cacheMap[name]) return;

    cacheMap[name] = true;
    let project = depMap[name];

    if (!project) {
        throw new Error(`missing project ${name}`);
    }

    // remove deps first
    return Promise.all(project.deps.map((depName) => removeModule(project.path, depName))).then(() => {
        return runSequence(
            project.deps.map((depName) => {
                return () => installDepLocal(depName, depMap, {
                    cacheMap
                });
            })
        ).then(() => {
            return runSequence(
                project.deps.map((depName) => {
                    let depPath = depMap[depName].path;
                    return () => installModule(project.path, depName, depPath);
                })
            );
        });
    });
};

module.exports = installDepLocal;
