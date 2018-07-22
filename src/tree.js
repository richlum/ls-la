"use strict";
exports.__esModule = true;
var fs = require('fs');
var path = require('path');
var rootdir = '.';
if (process.argv.length > 2)
    rootdir = process.argv[2];
var isDir = function isDir(fileobj) {
    return new Promise(function (resolve, reject) {
        fs.stat(fileobj.fullpath, function (err, stats) {
            if (err)
                return reject(err);
            fileobj.isdir = stats.isDirectory();
            return resolve(fileobj);
        });
    });
};
var toFileObj = function toFileObj(name) {
    return new Promise(function (resolve, reject) {
        var fileobj = {
            name: path.basename(name),
            isdir: false,
            fullpath: path.resolve(name),
            files: [],
            dirs: [],
            fileobjs: []
        };
        isDir(fileobj)
            .then(function (fileobj) { return resolve(fileobj); })["catch"](function (err) { return reject(err); });
    });
};
var readobjdir = function readobjdir(fileobj) {
    return new Promise(function (resolve, reject) {
        fs.readdir(fileobj.fullpath, function (err, files) {
            if (err)
                return reject(err);
            fileobj.files = files.map(function (file) { return path.resolve(file); });
            //console.log(53, fileobj)
            return resolve(fileobj);
        });
    });
};
var readdir = function readdir(dir) {
    return new Promise(function (resolve, reject) {
        fs.readdir(dir, function (err, files) {
            if (err)
                return reject(err);
            return resolve(files.map(function (file) { return path.resolve(file); }));
        });
    });
};
var classify = function classify(fileobj) {
    return new Promise(function (resolve, reject) {
        var fileobjlist = [];
        fileobj.files.map(function (fl) {
            fileobjlist.push(toFileObj(fl).then(isDir));
        });
        Promise.all(fileobjlist)
            .then(function (fobjlist) {
            fileobj.files = fobjlist.filter(function (fl) { return !fl.isdir; }).map(function (fl) { return fl.name; });
            fileobj.fileobjs = fobjlist.filter(function (fl) { return fl.isdir; });
            return fileobj;
        })
            .then(function (fileobj) { return resolve(fileobj); })["catch"](function (err) { return reject(err); });
    });
};
var recurse = function recurse(fileobj) {
    return new Promise(function (resolve, reject) {
        if (!fileobj.isdir)
            return resolve(fileobj);
        fileobj.fileobjs.forEach(function (fobj) {
            console.log(93, fobj);
            readobjdir(fobj)
                .then(classify)["catch"](function (err) { return reject(err); });
        });
    });
};
// readdir(rootdir)
// .then(console.log)
// .catch(console.error)
toFileObj(rootdir)
    .then(isDir)
    //.then ( (x) => { console.log(x); return x; })
    .then(readobjdir)
    .then(classify)
    .then(recurse)
    .then(function (x) { console.log(x); return x; })["catch"](console.error);
