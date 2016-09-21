'use strict';

let {
    runSequence, installModule, removeModule
} = require('./util');

let DepMap = require('./depMap');

let log = console.log; // eslint-disable-line

module.exports = () => {
    let installDepLocal = (name, {
        appDir,
        depDir,
        cacheMap = {}
    }) => {
        if (cacheMap[name]) return;

        log(`install local deps for ${name}`);
        cacheMap[name] = true;
        let depMap = DepMap(appDir, depDir);
        let project = depMap[name];

        if (!project) {
            throw new Error(`missing project ${name}`);
        }

        // remove deps first
        return Promise.all(project.deps.map((depName) => removeModule(project.path, depName))).then(() => {
            return runSequence(
                project.deps.map((depName) => {
                    return () => installDepLocal(depName, {
                        appDir,
                        depDir,
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

    return installDepLocal;
};
