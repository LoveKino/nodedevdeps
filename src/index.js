'use strict';

let {link, linkProject} = require('./link');

let installLocal = require('./installLocal');

/**
 * only need to declare developing node packages's dependency relationships
 *
 * depMap={
 *      {name}: {
 *          path,
 *          deps:[{name}]
 *      }
 * }
 */

module.exports = {
    link,
    linkProject,
    installLocal
};
