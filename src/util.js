'use strict';

let path = require('path');

let fs = require('mz/fs');

let del = require('del');

let promisify = require('promisify-node');

let ncp = require('ncp');

let {
    exec
} = require('mz/child_process');

ncp = promisify(ncp);

let log = console.log; // eslint-disable-line

let hasDirectory = (filePath) => {
    return fs.stat(filePath).then(stats => {
        return stats.isDirectory();
    }).catch(() => {
        return false;
    });
};

let installModule = (cur, name, dep) => {
    let cmd = `npm install --save ${dep}`;

    return removeModule(cur, name).then(() => {
        log(`[install local] in ${cur}, cmd is ${cmd}`);
        return exec(cmd, {
            cwd: cur,
            stdio: 'inherit'
        });
    });
};

let copyModule = (cur, name, dep) => {
    return removeModule(cur, name).then(() => {
        return ncp(dep, path.join(cur, 'node_modules', name));
    });
};

let removeModule = (cur, name) => {
    let modulePath = path.join(cur, 'node_modules', name);
    return del([modulePath]);
};

let getPackageJson = (projectRoot) => {
    return fs.readFile(path.join(projectRoot, 'package.json'), 'utf-8').then(json => {
        return JSON.parse(json);
    });
};

let setPackageJson = (projectRoot, json) => {
    return fs.writeFile(path.join(projectRoot, 'package.json'), JSON.stringify(json, null, 4), 'utf-8');
};

let chain = (generators) => {
    let gens = generators.slice(0);
    if (!generators.length) {
        return Promise.resolve([]);
    }

    let first = gens.shift();
    return Promise.resolve(first()).then(ret => {
        return chain(gens).then((rest) => [ret].concat(rest));
    });
};

let runSequence = (list) => {
    if (!list.length) {
        return Promise.resolve();
    }
    let v = list[0]();
    return Promise.resolve(v).then(() => {
        return runSequence(list.slice(1));
    });
};

let sleep = (duration) => {
    return new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
};

module.exports = {
    hasDirectory,
    getPackageJson,
    setPackageJson,
    chain,
    installModule,
    removeModule,
    copyModule,
    runSequence,
    sleep
};
