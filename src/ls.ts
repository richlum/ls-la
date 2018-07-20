export {};

const fs = require('fs');
const path = require('path');

let basedir = '.';
if (process.argv.length>2)
  basedir = process.argv[2];


interface FileObject {
  name: string,
  fullpath: string,
  isdir?: boolean
}
interface DirObject extends FileObject{
  files: FileObject[],
  dirs : DirObject[]
}

const fnToFileObj = function fnToFileObj(name:string):FileObject{
  let fileobj:FileObject = {
    name: name,
    fullpath: path.resolve(basedir)
  };
  return fileobj;
}

const is_dir = function is_dir(fileobj:FileObject):Promise<FileObject>{
  return new Promise(function(resolve,reject){
    fs.stat(fileobj.name,function(err,stats){
      if (err) return reject(err);
      let newfileobj = Object.assign({},fileobj,{ isdir: stats.isDirectory()});
      return resolve(newfileobj)
    })
  })
}

const populateDirFiles = function populateDirFiles(dirobj:DirObject):Promise<DirObject>{
  return new Promise(function (resolve,reject){
    fs.readdir(dirobj.fullpath,function(err,files){
      if (err) return reject(err);
      let dirsobjs:DirObject[] = [];
      let filesobjs:FileObject[] = [];
      files.forEach( (fl) => {
        is_dir(fnToFileObj(fl))
        .then(fobjToDirObjMaybe)
        .then((obj) => {
          if (obj.isdir){
            dirsobjs.push(<DirObject>obj);
          }else{
            filesobjs.push(obj);
          }
        })
        .catch( (err) =>{
          return reject(err);
        })
      });
      dirobj.dirs = dirsobjs;
      dirobj.files = filesobjs;
      return resolve(dirobj);
    })
  })
}

const fobjToDirObjMaybe = function fobjToDirObjMaybe(fileobj:FileObject):Promise<FileObject|DirObject>{
  return new Promise(function(resolve,reject){
    if (fileobj.isdir) {
      let dirobj:DirObject = Object.assign({},fileobj,{files:[],dirs:[]});
      populateDirFiles(dirobj)
      .then ((dirobj) => {
        return resolve(dirobj);
      })
    } else {
      return resolve(fileobj);
    }
  })
}





is_dir(fnToFileObj(basedir))
.then(fobjToDirObjMaybe)
.then(console.log)
.catch(console.error);
