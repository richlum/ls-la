const fs = require('fs');
//const fsPromises = require('fs').promises;
const path = require('path');
const config = require('./config');
let fullroot;
function dir(root) {
    fullroot = path.resolve(root);
    return new Promise(function (resolve, reject) {
        fs.readdir(root, function (err, files) {
            if (err)
                return reject(err);
            let fullpathfiles = files.map(fl => path.resolve(root, fl));
            /*			let relpathfiles = fullpathfiles.map(fl => path.relative(root,fl));
                        console.log('root',root);
                        console.log('fullroot',fullroot);
                        console.log('fullpathfiles',fullpathfiles);
                        console.log('relpathfiles',relpathfiles);
                        return resolve (relpathfiles);
            */ return resolve(fullpathfiles);
        });
    });
}
function isdir(file) {
    return new Promise(function (resolve, reject) {
        fs.stat(file, function (err, stats) {
            if (err)
                return reject(err);
            return resolve(stats.isDirectory());
        });
    });
}
function filterOnly(files, filterfunc, type) {
    let resultlist = files.map(file => new Promise(function (resolve, reject) {
        isdir(file)
            .then((isdir) => {
            if (filterfunc(isdir, type)) {
                return resolve(file);
            }
            else {
                return resolve(0);
            }
        })
            .catch(err => { return reject(err); });
    }));
    let filesonly = [];
    return Promise.all(resultlist)
        .then((files) => {
        filesonly = files.filter((file) => {
            return (file != 0);
        });
        return Promise.resolve(filesonly);
    });
}
// const onlyfiles = 'FILES';
// const onlydirs  = 'DIRS';
var FilterType;
(function (FilterType) {
    FilterType[FilterType["FILES"] = 0] = "FILES";
    FilterType[FilterType["DIRS"] = 1] = "DIRS";
})(FilterType || (FilterType = {}));
function filterPass(isdir, type) {
    if (type === FilterType.FILES) {
        return !isdir;
    }
    return isdir;
}
function filesOnly(files) {
    return filterOnly(files, filterPass, FilterType.FILES);
}
function dirsOnly(files) {
    return filterOnly(files, filterPass, FilterType.DIRS);
}
exports.scandir = function scandir(root) {
    return new Promise(function (resolve, reject) {
        dir(root)
            .then((allfiles) => {
            return Promise.all([filesOnly(allfiles),
                dirsOnly(allfiles)])
                .then((results) => {
                let cwd = {
                    files: results[0],
                    dirs: results[1],
                    fullpath: path.resolve(root)
                };
                cwd.files = results[0];
                cwd.dirs = results[1];
                cwd.fullpath = path.resolve(root);
                return resolve(cwd);
            })
                .catch(err => { return reject(err); });
        })
            .catch(console.error);
    });
};
function makeoutdir() {
    return new Promise(function (resolve, reject) {
        let targetdir = config.out;
        fs.mkdir(targetdir, function (err) {
            if (err)
                //reject(`Failed to create ${targetdir} : ${err}`);
                console.log(97, `targetdir = ${targetdir}`);
            return resolve(targetdir);
        });
    })
        .catch((err) => {
        console.error(err);
        //Promise.reject(err);
    });
}
function copydirs(obj) {
    let count = 0;
    let dirlist = obj.dirs;
    return new Promise(function (resolve, reject) {
        let obj = obj;
        makeoutdir()
            .then((outdir) => {
            if (!outdir)
                return resolve(0);
            console.log(112, outdir);
            dirlist.forEach((dir) => {
                let reltarg = path.relative(fullroot, dir);
                let fulltarg = path.join(outdir, reltarg);
                console.log('copydirs', fulltarg);
                fs.mkdir(fulltarg, function (err) {
                    if (err) {
                        console.error(`Failed to create ${fulltarg} : ${err}`);
                        //reject(fulltarg + err );
                    }
                    count++;
                    if (count >= dirlist.length) {
                        console.log(126, obj);
                        return Promise.resolve(obj);
                    }
                });
            });
            return Promise.resolve(obj);
        }).then(x => x)
            .catch((err) => {
            return reject(err);
        });
    })
        .catch(console.error);
}
function copyfile(file, dst) {
    return new Promise(function (resolve, reject) {
        fs.copyFile(file, dst, function (err) {
            if (err) {
                console.error(err);
            }
            return resolve(file);
        });
    });
}
function copyfiles(obj) {
    let targetdir = config.out;
    let files = obj.files;
    return new Promise(function (resolve, reject) {
        let cnt = 0;
        let copyfilelist = [];
        files.forEach((file) => {
            let reltarg = path.relative(fullroot, file);
            let fulltarg = path.join(targetdir, reltarg);
            console.log(148, 'copyfile', file, reltarg, fulltarg);
            copyfilelist.push(copyfile(file, fulltarg));
            cnt++;
            if (cnt >= files.length) {
                console.log(149, obj);
                Promise.all(copyfilelist)
                    .then(() => { return resolve(obj); });
            }
        });
        Promise.all(copyfilelist)
            .then(() => { return resolve(obj); })
            .catch((err) => {
            return reject(err);
        });
    });
}
function hasDirStr(dirlist) {
    if (dirlist.length > 0) {
        let dirstrs = dirlist.filter((name) => ((typeof name) === 'string'));
        return dirstrs.length > 0;
    }
}
function dirnameToDirObj(root) {
    if ((root.dirs) && (hasDirStr(root.dirs))) {
        let newDirList = root.dirs.map((dirname) => {
            dirsubobj = {};
            dirsubobj.files = [];
            dirsubobj.dirs = [];
            dirsubobj.fullpath = dirname;
            dirobj = (typeof dirname) === 'string'
                ? dirsubobj : dirname;
            return dirobj;
        });
        root.dirs = newDirList;
        console.log('dirnameToDirObj', root);
    }
}
exports.dir = dir;
exports.isdir = isdir;
exports.filesOnly = filesOnly;
exports.dirsOnly = dirsOnly;
exports.copydirs = copydirs;
exports.copyfiles = copyfiles;
exports.dirnameToDirObj = dirnameToDirObj;
//# sourceMappingURL=recurse.js.map