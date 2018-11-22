const config = require('../config').database
const MongoClient = require('mongodb').MongoClient;
const url = `mongodb://${config.HOST}:${config.PORT}`
var ObjectID = require('mongodb').ObjectID;

// const url = 'mongodb://localhost:27017';

// Database Name
//const dbName = 'mogodbDemo';

/**
 * 查询数据
 * @param dbName
 * @param callback
 * @returns {Promise<any>}
 */
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

/**
 * 新增数据
 * @param dbName
 * @param table
 * @param obj
 * @returns {*}
 */
const insert = (dbName, table, obj) => {
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

/**
 * 通过ID删除
 * @param dbName
 * @param table
 * @param id
 * @returns {*}
 */
const remove = (dbName, table, id) => {
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

/**
 * 更新数据
 * @param dbName
 * @param table
 * @param id
 * @param obj
 * @returns {*}
 */
const updata = (dbName, table, id, obj) => {
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

/**
 * 通过ID查询
 * @param dbName
 * @param table
 * @param id
 * @returns {*}
 */
const findId = (dbName, table, id) => {
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

/**
 * 查找总记录数
 * @param dbName
 * @param table
 * @param filter
 * @returns {*}
 */
const findCount = (dbName, table, filter) => {
    filter = filter || {}
    return query(dbName, function (db) {
        return new Promise((resolve, reject) => {
            const collection = db.collection(table)
            collection.find(filter).count().then(count => {
                resolve(count)
            }, err => {
                reject(err)
            }).catch(err => {
                reject(err)
            })

        })
    })
}

/**
 * 分页查询
 * @param dbName 数据库名
 * @param table 表名
 * @param filter
 * @param pageNum
 * @param pageSize
 * @returns {*}
 */
const findTablePage = (dbName, table, filter, pageNum, pageSize) => {
    filter = filter || {}
    pageNum = pageNum || 1
    pageSize = pageSize || 10
    return query(dbName, function (db) {
        return new Promise((resolve, reject) => {
            const collection = db.collection(table)
            collection.find(filter).sort({"_nowtime": -1}).limit(pageSize).skip((pageNum - 1) * pageSize).toArray((err, result) => {
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
//查询详情
const findTableInfo = (dbName, table, filter) => {
    filter = filter || {}
    return query(dbName, function (db) {
        return new Promise((resolve, reject) => {
            const collection = db.collection(table)
            collection.find(filter).toArray((err, result) => {
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

//查询表格
const findTableList = (dbName, table, filter) => {
    filter = filter || {}
    return query(dbName, function (db) {
        return new Promise((resolve, reject) => {
            const collection = db.collection(table)
            collection.find(filter).toArray((err, result) => {
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


module.exports = {
    findCount,
    insert,
    remove,
    updata,
    findId,
    findTablePage,
    findTableList,
    findTableInfo
}