const config = require('../config').database
const MongoClient = require('mongodb').MongoClient;
const url = `mongodb://${config.HOST}:${config.PORT}`
var ObjectID = require('mongodb').ObjectID;

// const url = 'mongodb://localhost:27017';

// Database Name
//const dbName = 'mogodbDemo';

let query = function (dbName, callback) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                reject(err)
            } else {
                let db = client.db(dbName)
                callback(db).then(res => {
                    resolve(res)
                    client.close()
                })
            }
        });
    })
}


const insert = (dbName,table, obj) => {
    return query(dbName, function (db) {
        return new Promise((resolve, reject) => {
            const collection = db.collection(table);
            collection.insert(obj, function (err, result) {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    })
}

const remove = (dbName,table, id) => {
    return query(dbName, function (db) {
        return new Promise((resolve, reject) => {
            const collection = db.collection(table);
            collection.findAndRemove({
                _id: new ObjectID(id)
            }, function (err, result) {
                if (err) {
                    reject(err)
                } else {
                    console.dir(result)
                    resolve(result)
                }
            })

        })

    })
}

const updata = (dbName,table, id, obj) => {
    return query(dbName, function (db) {
        return new Promise((resolve, reject) => {
            const collection = db.collection(table);
            collection.updateOne({
                _id: new ObjectID(id)
            }, {
                $set: obj
            }, function (err, result) {
                if (err) {
                    reject(err)
                } else {
                    console.dir(result)
                    resolve(result)
                }
            })

        })

    })
}

const findId = (dbName,table, id) => {
    return query(dbName, function (db) {
        return new Promise((resolve, reject) => {
            const collection = db.collection(table)
            collection.find({
                _id: new ObjectID(id)
            }).toArray(
                function (err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        console.dir(result)
                        resolve(result)
                    }
                }
            )
        })
    })
}

//总记录数
const findCount=(dbName,table,filter) =>{
    filter = filter|| {}
    return query(dbName,function(db){
        return new Promise((resolve,reject)=>{
            const collection = db.collection(table)
            collection.find(filter).count().then(count=>{
                resolve(count)
            },err=>{
                reject(err)
            }).catch(err=>{
                reject(err)
            })
            
        })
    })
}

//分页查询
const findTablePage = (dbName,table,filter,pageNum,pageSize) =>{
     filter = filter|| {}
     pageNum = pageNum|| 1
     pageSize = pageSize|| 10
    return query(dbName,function(db){
        return new Promise((resolve,reject)=>{
            const collection = db.collection(table)
            collection.find(filter).sort({"_nowtime":-1}).limit(pageSize).skip((pageNum-1)*pageSize).toArray((err,result)=>{
                if(err){
                    reject(err)
                }else{
                    console.dir(result)
                    resolve(result)
                }
            })
        })
    })
}

//查询表格
const findTableList = (dbName,table,filter) =>{
     filter = filter|| {}
    return query(dbName,function(db){
        return new Promise((resolve,reject)=>{
            const collection = db.collection(table)
            collection.find(filter).toArray((err,result)=>{
                if(err){
                    reject(err)
                }else{
                    console.dir(result)
                    resolve(result)
                }
            })
        })
    })
}

module.exports = {
    findCount,
    insert,
    remove,
    updata,
    findId,
    findTablePage,
    findTableList
}