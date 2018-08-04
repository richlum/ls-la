import { resolve } from "dns";

/*
  20180804 Promise based directory scan that captures a 
    hierarchal json object representation of the file structure 
    with attributes that capture the full path and wether dir 
    or not and what files/subdirectories are contained at 
    each level. Since it is async, hopefully, it runs faster.

    When traversing, its best to keep the constant datastructure 
    and modify its contents as required and pass the same data 
    structure around.  Components are broken out to build the
    structure and then we need to use the same tools as we find
    new nodes to rebuild the constant structure as we walk the
    directory.  Turns out typescript is very helpful in keeping
    the discipline of knowing what types we receive and what
    types we generate.....

    walk takes the json object file object and flattens it
    to a single level json object that contains an array of
    files and an array of directories with full path names
    so you can use it as a worklist via normal iteration.
*/

export {};

const fs = require('fs');
const path = require('path');

let basedir = '.';
if (process.argv.length>2)
  basedir = process.argv[2];

let fullroot = path.resolve(basedir)
console.log( `basedir = ${basedir} fullroot = ${fullroot}`)

let filelist = [];
let dirlist = [];

interface FileObject {
  name: string,
  fullpath: string,
  isdir?: boolean,
  files?:string[],
  fileobjs?:FileObject[]
}
interface Files{
  files:string[],
  dirs:string[]
}
// module level object to hold our result
let aflatobj:Files = {
  files:[],
  dirs:[]
}

// flatobj is our accumulator as we recurse down the fileobj
const walk:(fileobj:FileObject, flatobj:Files )=>Promise<Files> = (fileobj,flatobj) => {
  let result:Files = {
    files:[],
    dirs:[]
  }
  if ((!fileobj)||(!fileobj.fileobjs)) {
    return Promise.resolve(result);
  }
  let dirs:string[]  = (fileobj.fileobjs.filter( fobj =>  fobj.isdir).map(fobj => fobj.fullpath))
  let fils:string[] = (fileobj.fileobjs.filter( fobj => !fobj.isdir).map(fobj => fobj.fullpath))

  flatobj.files = flatobj.files.concat(fils);
  flatobj.dirs  = flatobj.dirs.concat(dirs);

  fileobj.fileobjs.filter( fobj => fobj.isdir)
  .forEach( fobj => {
    walk(fobj,flatobj)
  })

  return Promise.resolve(flatobj)
}


const isdir = function isdir(fileobj:FileObject):Promise<FileObject>{
  return new Promise(function(resolve,reject){
    fs.stat(fileobj.fullpath,function(err,stats){
      if (err) return reject(err);
      let newfileobj = Object.assign({},fileobj,{ isdir: stats.isDirectory()});
      return resolve(newfileobj)
    })
  })
}

const fnToFileObj:(pathname:string)=>Promise<FileObject> = (pathname) => {
  let fileobj:FileObject = {
    name : path.basename(pathname),
    fullpath: pathname
  }
  return Promise.resolve(fileobj);
}

const populateFiles = function populateDirFiles(dirobj:FileObject):Promise<FileObject>{
  return new Promise(function (resolve,reject){
    fs.readdir(dirobj.fullpath,function(err,files){
      if (err) return reject(err);
      let filesobjs:FileObject[] = [];
      files.forEach( (fl) => {
        fnToFileObj(dirobj.fullpath)
        .then(isdir)
        .then((obj) => {
            filesobjs.push(<FileObject>obj);
        })
        .catch( (err) =>{
          return reject(err);
        })
      });
      dirobj.fileobjs  = filesobjs;
      return resolve(dirobj);
    })
  })
}

const getNodes = (filobj:FileObject):Promise<FileObject> =>
  new Promise(function (resolve,reject){
    if (!filobj.isdir)
      return resolve(filobj)
    fs.readdir(filobj.fullpath,function(err,files){
      if (err) return reject(err)
      filobj.files = files.map( file => path.join(filobj.fullpath,file))
      return resolve(filobj)
    })
  })


// the recursion loop is between the following two methods  
const getSubFileObjs:(fileobj:FileObject)=>Promise<FileObject> = (fileobj) => 
  new Promise( (resolve,reject) => {
    
    isdir(fileobj)
    .then(getNodes)
    .then(subFiles)
    .then(  (fileobj) => {
      return resolve(fileobj)
    })
    .catch(console.error)
  })

// handle the breadth of objs recursing  down if its a directory
const subFiles = (filobj:FileObject):Promise<FileObject> =>
  new Promise( (resolve,reject) =>{
    if (!filobj||!filobj.files||filobj.files.length<=0)
      return resolve(filobj)
    let filobjs:Promise<FileObject>[] = filobj.files.map( file => fnToFileObj(file)
      .then(isdir)
      .then(getNodes)
      .then( (x) =>{
        return getSubFileObjs(x)
      })
    )
    Promise.all(filobjs)
    .then(
      filobjs => {
        filobj.fileobjs = filobjs
        return resolve(filobj) 
      }
    )
    .catch(console.error)
  })


fnToFileObj(fullroot)
.then(isdir)
.then(getNodes)
.then(subFiles)
.then( (x) => { 
    console.log(JSON.stringify(x,null,2))
    return x;
  })
.then( x => {
  return walk(x,aflatobj)
})
.then ( x=> {
  console.log(JSON.stringify(x,null,2))
})
.catch(console.error)