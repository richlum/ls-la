const fs = require('fs');
const path = require('path');
let basedir = '.';
if (process.argv.length > 2)
    basedir = process.argv[2];
let fullroot = path.resolve(basedir);
console.log(`basedir = ${basedir} fullroot = ${fullroot}`);
let filelist = [];
let dirlist = [];
let aflatobj = {
    files: [],
    dirs: []
};
const walk = (fileobj, flatobj) => {
    let result = {
        files: [],
        dirs: []
    };
    if ((!fileobj) || (!fileobj.fileobjs)) {
        console.log(35, "walk returning no filobj");
        return Promise.resolve(result);
    }
    let dirs = (fileobj.fileobjs.filter(fobj => fobj.isdir).map(fobj => fobj.fullpath));
    let fils = (fileobj.fileobjs.filter(fobj => !fobj.isdir).map(fobj => fobj.fullpath));
    console.log(41, 'walk dirs');
    console.log(JSON.stringify(dirs, null, 2));
    console.log(43, 'walk file');
    console.log(JSON.stringify(fils, null, 2));
    flatobj.files = flatobj.files.concat(fils);
    flatobj.dirs = flatobj.dirs.concat(dirs);
    fileobj.fileobjs.filter(fobj => fobj.isdir)
        .forEach(fobj => {
        walk(fobj, flatobj);
    });
    console.log(59, 'walk returning file', flatobj.files.length, flatobj.dirs.length);
    return Promise.resolve(flatobj);
};
const isdir = function isdir(fileobj) {
    console.log(24, 'isdir', fileobj);
    return new Promise(function (resolve, reject) {
        fs.stat(fileobj.fullpath, function (err, stats) {
            if (err)
                return reject(err);
            let newfileobj = Object.assign({}, fileobj, { isdir: stats.isDirectory() });
            return resolve(newfileobj);
        });
    });
};
const fnToFileObj = (pathname) => {
    console.log(33, 'fnToFileObj', pathname);
    let fileobj = {
        name: path.basename(pathname),
        fullpath: pathname
    };
    console.log(38, 'fnToFileObj', fileobj);
    return Promise.resolve(fileobj);
};
const populateFiles = function populateDirFiles(dirobj) {
    return new Promise(function (resolve, reject) {
        fs.readdir(dirobj.fullpath, function (err, files) {
            if (err)
                return reject(err);
            let filesobjs = [];
            files.forEach((fl) => {
                fnToFileObj(dirobj.fullpath)
                    .then(isdir)
                    .then((obj) => {
                    filesobjs.push(obj);
                })
                    .catch((err) => {
                    return reject(err);
                });
            });
            dirobj.fileobjs = filesobjs;
            return resolve(dirobj);
        });
    });
};
const getNodes = (filobj) => new Promise(function (resolve, reject) {
    if (!filobj.isdir)
        return resolve(filobj);
    fs.readdir(filobj.fullpath, function (err, files) {
        if (err)
            return reject(err);
        filobj.files = files.map(file => path.join(filobj.fullpath, file));
        console.log(113, 'getNodes', filobj);
        return resolve(filobj);
    });
});
const getSubFileObjs = (fileobj) => new Promise((resolve, reject) => {
    console.log(81, 'getSubFileObjs', fileobj);
    isdir(fileobj)
        .then(getNodes)
        .then(subFiles)
        .then((fileobj) => {
        return resolve(fileobj);
    })
        .catch(console.error);
});
const subFiles = (filobj) => new Promise((resolve, reject) => {
    console.log(136, 'subFiles', filobj);
    if (!filobj || !filobj.files || filobj.files.length <= 0)
        return resolve(filobj);
    let filobjs = filobj.files.map(file => fnToFileObj(file)
        .then(isdir)
        .then(getNodes)
        .then((x) => {
        return getSubFileObjs(x);
    }));
    Promise.all(filobjs)
        .then(filobjs => {
        filobj.fileobjs = filobjs;
        return resolve(filobj);
    })
        .catch(console.error);
});
fnToFileObj(fullroot)
    .then(isdir)
    .then(getNodes)
    .then(subFiles)
    .then((x) => {
    console.log(155);
    console.log(JSON.stringify(x, null, 2));
    console.log(157);
    return x;
})
    .then(x => {
    return walk(x, aflatobj);
})
    .then(x => {
    console.log(JSON.stringify(x, null, 2));
})
    .catch(console.error);
//# sourceMappingURL=play2.js.map