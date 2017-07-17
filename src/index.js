'use strict';

let {
    link, linkProject
} = require('./link');

let {
    cleanLink, cleanProjectLink
} = require('./unlink');

let installLocal = require('./installLocal');

let install = require('./install');

/**
 * only need to declare developing node packages's dependency relationships
 *
 * depMap={
 *      {name}: {
 *          path,
 *          deps:[{name}]
 *      }
 * }
 *
 * TODO update all node modules for a dependency
 *
 * TODO convert link type project to normal node module
 */

module.exports = {
    link,
    linkProject,
    cleanLink,
    cleanProjectLink,
    installLocal,
    install
};
