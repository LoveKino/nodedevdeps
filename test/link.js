'use strict';

let {
    link
} = require('..');
let path = require('path');

let {
    toDisk
} = require('filetreemap');

const fixture = path.join(__dirname, 'fixture');

const PKG_JSON_TPL = (name) => `{
  "name": "${name}",
  "version": "0.0.1",
  "description": "module tpl",
  "main": "index.js",
  "scripts": {
  },
  "author": "",
  "license": "ISC"
}`;

describe('link', () => {
    it('base', () => {
        let testDir = fixture + '/test1';

        return toDisk({
            type: 'directory',
            files: {
                module1: {
                    type: 'directory',
                    files: {
                        'package.json': {
                            type: 'file',
                            content: PKG_JSON_TPL('module1')
                        }
                    }
                },
                module2: {
                    type: 'directory',
                    files: {
                        'package.json': {
                            type: 'file',
                            content: PKG_JSON_TPL('module2')
                        }
                    }
                }
            }
        }, testDir).then(() => {
            return link({
                module1: {
                    path: path.join(testDir, 'module1'),
                    deps: ['module2']
                },
                module2: {
                    path: path.join(testDir, 'module2')
                }
            });
        });
    });
});
