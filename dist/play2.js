const fs = require('fs');
const path = require('path');
let basedir = '.';
if (process.argv.length > 2)
    basedir = process.argv[2];
let fullroot = path.resolve(basedir);
console.log(`basedir = ${basedir} fullroot = ${fullroot}`);
let filelist = [];
let dirlist = [];
// module level object to hold our result
let aflatobj = {
    files: [],
    dirs: []
};
// flatobj is our accumulator as we recurse down the fileobj
const walk = (fileobj, flatobj) => {
    let result = {
        files: [],
        dirs: []
    };
    if ((!fileobj) || (!fileobj.fileobjs)) {
        return Promise.resolve(result);
    }
    let dirs = (fileobj.fileobjs.filter(fobj => fobj.isdir).map(fobj => fobj.fullpath));
    let fils = (fileobj.fileobjs.filter(fobj => !fobj.isdir).map(fobj => fobj.fullpath));
    flatobj.files = flatobj.files.concat(fils);
    flatobj.dirs = flatobj.dirs.concat(dirs);
    fileobj.fileobjs.filter(fobj => fobj.isdir)
        .forEach(fobj => {
        walk(fobj, flatobj);
    });
    return Promise.resolve(flatobj);
};
const isdir = function isdir(fileobj) {
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
    let fileobj = {
        name: path.basename(pathname),
        fullpath: pathname
    };
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
        return resolve(filobj);
    });
});
// the recursion loop is between the following two methods  
const getSubFileObjs = (fileobj) => new Promise((resolve, reject) => {
    isdir(fileobj)
        .then(getNodes)
        .then(subFiles)
        .then((fileobj) => {
        return resolve(fileobj);
    })
        .catch(console.error);
});
// handle the breadth of objs recursing  down if its a directory
const subFiles = (filobj) => new Promise((resolve, reject) => {
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
    console.log(JSON.stringify(x, null, 2));
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