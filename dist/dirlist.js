const fs = require('fs');
const path = require('path');
let rootdir = '.';
if (process.argv.length > 2)
    rootdir = process.argv[2];
let dirlist;
let fullrootpath;
let filelist;
const updateDirs = function updateDirs(fileobjlist) {
    console.log(19, fileobjlist.length);
    return new Promise(function (resolve, reject) {
        //let files = fileobjlist.filter( flobj => !flobj.isdir);
        let dirs = fileobjlist.filter(flobj => flobj.isdir);
        console.log(23, dirs);
        // any directories make recursive calls to get subdir files
        if (dirs.length > 0) {
            let drfiles = [];
            let cnt = 0;
            console.log(28, 'dirs', dirs);
            dirs.forEach((dir) => {
                cnt++;
                console.log(31, cnt, dir);
                getDirList(dir.fullpath)
                    .then(setDirs) // isdir : true/false
                    .then(updateDirs) // recursion point here, beyond this we prep to return
                    .then((listfileobjs) => {
                    listfileobjs.forEach((fileobj) => drfiles.push(fileobj));
                    dir.dirfiles = drfiles;
                    console.log(40, 'dir', dir);
                    // this should mutate our original input param fileobj
                    // is it bad form to mutate while iterating?
                    if (cnt >= dirs.length) {
                        console.log(45, 'async resolve');
                        return resolve(fileobjlist);
                    }
                    return `done ${dir} ${cnt}`;
                })
                    .catch(err => { return reject(err); });
            });
        }
        console.log(52, 'resolving updateDirs', fileobjlist);
        return resolve(fileobjlist);
    });
};
const getDirList = function getDirList(rootdir) {
    fullrootpath = path.resolve(rootdir);
    return new Promise(function (resolve, reject) {
        let fullpathfiles;
        fs.readdir(fullrootpath, function (err, files) {
            if (err)
                return reject(err);
            fullpathfiles = files.map(fl => {
                //          console.log(64,fl);
                let fileobj = {
                    fullpath: path.resolve(fullrootpath, fl),
                    isdir: false
                };
                return fileobj;
            });
            console.log(71, fullpathfiles);
            return resolve(fullpathfiles);
        });
    });
};
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
const setDirs = function setDirs(fileobjlist) {
    console.log(88, fileobjlist);
    return new Promise(function (resolve, reject) {
        let resultlist = fileobjlist.map((file) => isDir(file));
        Promise.all(resultlist)
            .then(resultlist => resolve(resultlist))
            .catch(err => reject(err));
    });
};
const trace = function trace(x) {
    return new Promise(function (resolve, reject) {
        console.log(98, x);
        return resolve(x);
    });
};
getDirList(rootdir)
    //.then(trace)
    .then(setDirs)
    //.then(trace)
    .then(updateDirs)
    .then(trace)
    .catch(console.error);
//# sourceMappingURL=dirlist.js.map