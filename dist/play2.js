const fs = require('fs');
const path = require('path');
let basedir = '.';
if (process.argv.length > 2)
    basedir = process.argv[2];
let fullroot = path.resolve(basedir);
console.log(`basedir = ${basedir} fullroot = ${fullroot}`);
let filelist = [];
let dirlist = [];
// const walk:(fileobj:FileObject)=>Promise<Files> = (fileobj) => {
//   let result:Files = {
//     files:[],
//     dirs:[]
//   }
//   if ((!fileobj)||(!fileobj.fileobjs)) return Promise.resolve(result);
//   let dirobjs:FileObject[]  = (fileobj.fileobjs.filter( fobj =>  fobj.isdir))
//   let fileobjs:FileObject[] = (fileobj.fileobjs.filter( fobj => !fobj.isdir))
//   dirobjs.forEach( dirobj => {
//     if (dirobj&&dirobj.fileobjs)
//       let dirsublist:string[] = dirobj.fileobjs.map( (fobj) => {
//         fobj => fobj.fileobjs})
//       result.dirs.push( dirsublist )
//     })
//   }
//   result.dirs.push
// }
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
const getFiles = (filobj) => new Promise(function (resolve, reject) {
    if (!filobj.isdir)
        return resolve(filobj);
    fs.readdir(filobj.fullpath, function (err, files) {
        if (err)
            return reject(err);
        filobj.files = files.map(file => path.join(filobj.fullpath, file));
        console.log(70, 'getFiles', filobj);
        return resolve(filobj);
    });
});
const getSubFileObjs = (fileobj) => new Promise((resolve, reject) => {
    console.log(81, 'getSubFileObjs', fileobj);
    isdir(fileobj)
        .then(getFiles)
        .then(subFiles)
        .then((fileobj) => {
        return resolve(fileobj);
    })
        .catch(console.error);
});
const subFiles = (filobj) => new Promise((resolve, reject) => {
    console.log(98, 'subFiles', filobj);
    if (!filobj || !filobj.files || filobj.files.length <= 0)
        return resolve(filobj);
    let filobjs = filobj.files.map(file => fnToFileObj(file)
        .then(isdir).then(getFiles)
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
    .then(getFiles)
    .then(subFiles)
    .then((x) => {
    console.log(100, x);
    console.log(JSON.stringify(x, null, 2));
    return x;
})
    .catch(console.error);
//# sourceMappingURL=play2.js.map