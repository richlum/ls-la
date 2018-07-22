const fs = require('fs');
const path = require('path');
let basedir = '.';
if (process.argv.length > 2)
    basedir = process.argv[2];
const fnToFileObj = function fnToFileObj(name) {
    let fileobj = {
        name: name,
        fullpath: path.resolve(basedir)
    };
    return fileobj;
};
const is_dir = function is_dir(fileobj) {
    return new Promise(function (resolve, reject) {
        fs.stat(fileobj.name, function (err, stats) {
            if (err)
                return reject(err);
            let newfileobj = Object.assign({}, fileobj, { isdir: stats.isDirectory() });
            return resolve(newfileobj);
        });
    });
};
const populateDirFiles = function populateDirFiles(dirobj) {
    return new Promise(function (resolve, reject) {
        fs.readdir(dirobj.fullpath, function (err, files) {
            if (err)
                return reject(err);
            let dirsobjs = [];
            let filesobjs = [];
            files.forEach((fl) => {
                is_dir(fnToFileObj(fl))
                    .then(fobjToDirObjMaybe)
                    .then((obj) => {
                    if (obj.isdir) {
                        dirsobjs.push(obj);
                    }
                    else {
                        filesobjs.push(obj);
                    }
                })
                    .catch((err) => {
                    return reject(err);
                });
            });
            dirobj.dirs = dirsobjs;
            dirobj.files = filesobjs;
            return resolve(dirobj);
        });
    });
};
const fobjToDirObjMaybe = function fobjToDirObjMaybe(fileobj) {
    return new Promise(function (resolve, reject) {
        if (fileobj.isdir) {
            let dirobj = Object.assign({}, fileobj, { files: [], dirs: [] });
            populateDirFiles(dirobj)
                .then((dirobj) => {
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
    .then(console.log)
    .catch(console.error);
//# sourceMappingURL=ls2.js.map