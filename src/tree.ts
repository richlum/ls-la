export {};

const fs = require('fs')
const path = require('path')

let rootdir = '.'
if (process.argv.length>2)
  rootdir = process.argv[2];
//rootdir = path.resolve(rootdir)

interface FileObj{
  name:string,
  fullpath:string,
  isdir:boolean,
  files:string[],
  dirs:string[],
  fileobjs:FileObj[]
}

const isDir = function isDir(fileobj:FileObj):Promise<FileObj>{
  return new Promise(function(resolve,reject){
    fs.stat(fileobj.fullpath,function(err,stats){
      if (err) return reject (err)
      fileobj.isdir = stats.isDirectory()
      return resolve(fileobj)
    })
  })
}


const toFileObj = function toFileObj(name:string):Promise<FileObj>{
  return new Promise(function(resolve,reject){
    let fileobj:FileObj = {
      name : path.basename(name),
      isdir: false,
      fullpath: path.resolve(name),
      files:[],
      dirs:[],
      fileobjs:[]
    }
    isDir(fileobj)
    .then( (fileobj) => {return resolve (fileobj)})
    .catch( (err) => reject(err))    
  })
}


const readobjdir = function readobjdir(fileobj:FileObj):Promise<FileObj>{
  return new Promise(function(resolve, reject){
    fs.readdir(fileobj.fullpath,function(err,files){
      if (err) return reject(err)
      fileobj.files = files.map( (file) => path.resolve(file))
      //console.log(53, fileobj)
      return resolve(fileobj)
    })
  })
};



const readdir = function readdir(dir:string):Promise<string[]>{
  return new Promise(function(resolve, reject){
    fs.readdir(dir,function(err,files){
      if (err) return reject(err)

      return resolve(files.map( (file) => path.resolve(file)))
    })
  })
};

const classify = function classify(fileobj:FileObj):Promise<FileObj>{
  return new Promise(function(resolve,reject){
    let fileobjlist:Promise<FileObj>[] = [];
    fileobj.files.map( (fl) => {
      fileobjlist.push(toFileObj(fl).then(isDir))
    })
    Promise.all(fileobjlist)
    .then( (fobjlist) => {
      fileobj.files = fobjlist.filter((fl) => { return !fl.isdir }).map( (fl) => fl.name )
      fileobj.fileobjs = fobjlist.filter((fl) => { return fl.isdir })
      return fileobj
    })
    .then( (fileobj) => { return resolve(fileobj) })
    .catch( (err) => { return reject(err) })
  })
}


const recurse = function recurse(fileobj:FileObj):Promise<FileObj>{
  return new Promise(function(resolve,reject){
    if (!fileobj.isdir) return resolve(fileobj)
    fileobj.fileobjs.forEach( (fobj) => {
      console.log(93,fobj)
      readobjdir(fobj)
      .then(classify)
      .catch( (err) => { return reject(err) })
    })
  })
}
// readdir(rootdir)
// .then(console.log)
// .catch(console.error)

toFileObj(rootdir)
.then(isDir)
//.then ( (x) => { console.log(x); return x; })
.then(readobjdir)
.then(classify)
.then(recurse)
.then ( (x) => { console.log(x); return x; })
.catch(console.error)
