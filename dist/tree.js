const fs = require('fs');
const path = require('path');
let rootdir = '.';
if (process.argv.length > 2)
    rootdir = process.argv[2];
//rootdir = path.resolve(rootdir)
let allfiles = [];
const isDir = function isDir(fileobj) {
    return new Promise(function (resolve, reject) {
        fs.stat(fileobj.fullpath, function (err, stats) {
            if (err)
                return reject(err);
            fileobj.isdir = stats.isDirectory();
            return resolve(fileobj);
        });
    });
};
const toFileObj = function toFileObj(name) {
    return new Promise(function (resolve, reject) {
        let fileobj = {
            name: path.basename(name),
            isdir: false,
            fullpath: path.resolve(name),
            files: [],
            //dirs:[],
            fileobjs: []
        };
        isDir(fileobj)
            .then((fileobj) => {
            //console.log(43,'toFileObj',fileobj);
            return resolve(fileobj);
        })
            .catch((err) => reject(err));
    });
};
const readobjdir = function readobjdir(fileobj) {
    return new Promise(function (resolve, reject) {
        fs.readdir(fileobj.fullpath, function (err, files) {
            if (err)
                return reject(err);
            fileobj.files = files.map((file) => path.resolve(fileobj.fullpath, file));
            console.log(53, 'readobjdir', fileobj);
            return resolve(fileobj);
        });
    });
};
const readdir = function readdir(dir) {
    return new Promise(function (resolve, reject) {
        fs.readdir(dir, function (err, files) {
            if (err)
                return reject(err);
            console.log(66, 'readdir', files);
            return resolve(files.map((file) => path.resolve(file)));
        });
    });
};
const classify = function classify(fileobj) {
    return new Promise(function (resolve, reject) {
        let fileobjlist = [];
        fileobj.files.map((fl) => {
            fileobjlist.push(toFileObj(fl).then(isDir));
        });
        Promise.all(fileobjlist)
            .then((fobjlist) => {
            fileobj.files = fobjlist.filter((fl) => { return !fl.isdir; }).map((fl) => fl.fullpath);
            allfiles = allfiles.concat(fileobj.files);
            fileobj.fileobjs = fobjlist.filter((fl) => { return fl.isdir; });
            console.log(82, 'classify files', fileobj.files);
            console.log(83, 'classify fileobjs', fileobj.fileobjs);
            return fileobj;
        })
            .then((fileobj) => { console.log(85, 'classify', fileobj); return (fileobj); })
            .then(recurse)
            .then(fobj => { return resolve(fobj); })
            .catch((err) => { return reject(err); });
    });
};
const recurse = function recurse(fileobj) {
    return new Promise(function (resolve, reject) {
        console.log(99, 'recurse', fileobj);
        if (!fileobj.isdir)
            return resolve(fileobj);
        if (fileobj.fileobjs.length <= 0)
            return resolve(fileobj);
        fileobj.fileobjs.forEach((fobj) => {
            console.log(93, 'recurse entry', fobj);
            readobjdir(fobj)
                .then(classify)
                .then((fileobj_ => { console.log(98, 'recurse after classify', fileobj); return resolve(fileobj); }))
                .catch((err) => { return reject(err); });
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
    //.then(recurse)
    .then((x) => { console.log(114, JSON.stringify(x)); return x; })
    .then((x) => { console.log(117, allfiles); console.log('total = ', allfiles.length); return x; })
    .catch(console.error);
//# sourceMappingURL=tree.js.map