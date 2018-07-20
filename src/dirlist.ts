const fs = require('fs');
const path = require('path');


let rootdir: string = '.';
if (process.argv.length>2)
  rootdir = process.argv[2];

let dirlist:string[];
let fullrootpath:string = path.resolve(rootdir);
let filelist:string[];

console.log('fullrootpath',fullrootpath);

interface fileobj {
  fullpath:string,
  isdir:boolean,
  dirfiles?:fileobj[]
}
const updateDirs = function updateDirs(fileobj:fileobj):Promise<fileobj>{
  console.log(19, 'updateDirs enter',
    path.relative(fullrootpath,fileobj.fullpath), 
    fileobj.fullpath, 
    fileobj);
  return new Promise( function(resolve,reject){
    //let files = fileobjlist.filter( flobj => !flobj.isdir);
    if (fileobj && fileobj.dirfiles){
      let dirs = fileobj.dirfiles.filter(flobj => flobj.isdir);
      console.log(24,dirs);
      // any directories make recursive calls to get subdir files
      if (dirs.length > 0){
        let drfiles:fileobj[] = [];
        let cnt = 0;
        console.log( 29,'dirs', dirs);
        dirs.forEach((dir) => {
          cnt++;
          console.log(32, cnt,
            path.relative(fullrootpath,dir.fullpath),
            dir )
          getDirList(dir.fullpath)
          .then(setDirs)        // isdir : true/false
          .then(updateDirs)     // recursion point here, beyond this we prep to return
          .then( (fileobj) => {
            if (fileobj&&fileobj.dirfiles){
              fileobj.dirfiles.forEach( (fileobj) => 
                drfiles.push(fileobj)
              );
              dir.dirfiles = drfiles;   
              console.log(42, 'dir', dir);
              // this should mutate our original input param fileobj
              // is it bad form to mutate while iterating?
              if (cnt>= dirs.length) {
                console.log(46, 'async resolve');
                return resolve(fileobj);
              }
              return `done ${dir} ${cnt}`;       
            }
          })
          .catch( err => {return reject(err)} );
          
        });
      }
    }
    console.log(57, 'updateDirs - exit',fileobj);
    return resolve(fileobj);
  });
}

const getDirList:(rootdir:string)=>Promise<fileobj> = function getDirList(rootdir:string):Promise<fileobj>{
  let rootpath = path.resolve(rootdir);
  return new Promise(function(resolve,reject){
    let fileobj:fileobj = { fullpath : rootdir, isdir: true };
    let fullpathfiles;
    fs.readdir(rootpath, function (err,files) {
      if (err) return reject(err);
        fullpathfiles = files.map(fl => {  
            console.log(70,`getDirList -files in ${rootpath}`,fl);
            fileobj:fileobj = {
            fullpath: path.resolve(rootpath,fl),
            isdir: false
          }
        return fileobj;
        });
      
      let rootdir:fileobj = {
        fullpath: rootpath,
        isdir : true,
        dirfiles: fullpathfiles
      } // todo: move before we scan directory
      isDir(rootdir)
        .then( (obj) => { 
          console.log(85,`getDirList - returning: `,JSON.stringify(obj,null,2))
          return resolve(obj) 
        })
        .catch( (err) => {return reject(err)});
    })
  });
}

const isDir = function isDir(fileobj:fileobj):Promise<fileobj>{
  return new Promise(function(resolve, reject){
    fs.stat(fileobj.fullpath,function(err,stats){
      if(err) return reject(err);
      fileobj.isdir = stats.isDirectory();
      return resolve(fileobj);
    })
  })
}

const setDirs = function setDirs(fileobj:fileobj):Promise<fileobj>{
  //console.log(94,'setdirs',fileobj);
  return new Promise(function(resolve,reject){
    if (fileobj&&fileobj.dirfiles){
      let resultlist = fileobj.dirfiles.map( (file) =>  isDir(file));
      Promise.all(resultlist)
      .then(resultlist => {
        fileobj.dirfiles = resultlist;
        //console.log(111,'setdirs out: ', fileobj);
        resolve(fileobj)
      })
      .catch(err => reject(err));
    } 
  });
}
const trace = function trace( x ){
  return new Promise(function(resolve,reject){
    console.log(109,x);
    return resolve(x);
  })
}

getDirList(rootdir)
// .then(trace)
.then(setDirs)
.then(trace)
.then(updateDirs)
.then(trace)
.catch(console.error);