"use strict";
exports.__esModule = true;
var fs = require('fs');
var path = require('path');
var basedir = '.';
if (process.argv.length > 2)
    basedir = process.argv[2];
var is_dir = function is_dir(fileobj) {
    return new Promise(function (resolve, reject) {
        fs.stat(fileobj.name, function (err, stats) {
            if (err)
                return reject(err);
            var newfileobj = Object.assign({}, fileobj, { isdir: stats.isDirectory() });
            return resolve(newfileobj);
        });
    });
};
var populateDirFiles = function populateDirFiles(dirobj) {
    return new Promise(function (resolve, reject) {
        fs.readdir(dirobj.fullpath, function (err, files) {
            if (err)
                return reject(err);
            var dirsobjs = [];
            var filesobjs = [];
            files.forEach(function (fl) {
                is_dir(fnToFileObj(fl))
                    .then(fobjToDirObjMaybe)
                    .then(function (obj) {
                    if (obj.isdir) {
                        dirsobjs.push(obj);
                    }
                    else {
                        filesobjs.push(obj);
                    }
                })["catch"](function (err) {
                    return reject(err);
                });
            });
            dirobj.dirs = dirsobjs;
            dirobj.files = filesobjs;
            return resolve(dirobj);
        });
    });
};
