"use strict";
exports.__esModule = true;
var fs = require('fs');
var path = require('path');
var basedir = '.';
if (process.argv.length > 2)
    basedir = process.argv[2];
var fnToFileObj = function fnToFileObj(name) {
    var fileobj = {
        name: name,
        fullpath: path.resolve(basedir)
    };
    return fileobj;
};
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
var fobjToDirObjMaybe = function fobjToDirObjMaybe(fileobj) {
    return new Promise(function (resolve, reject) {
        if (fileobj.isdir) {
            var dirobj = Object.assign({}, fileobj, { files: [], dirs: [] });
            populateDirFiles(dirobj)
                .then(function (dirobj) {
                return resolve(dirobj);
            });
        }
        else {
            return resolve(fileobj);
        }
    });
};
is_dir(fnToFileObj(basedir))
    .then(fobjToDirObjMaybe)
    .then(console.log)["catch"](console.error);
