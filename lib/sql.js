var mysql = require('mysql');

var config = require('../lib/config');

var async = require('async');
// 使用连接池，提升性能
// var pool  = mysql.createPool($util.extend({}, $conf.mysql));
var pool  = mysql.createPool(config.mysql);

//1. 执行语句返回结果
var onebyone = function(list,callback){
    if(!list.length){
        list = [list];
    }
    return new Promise(function(resolve,reject){
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err);
            }
            connection.beginTransaction(function (err) {
                if (err) {
                    reject(err);
                }
                var funcAry = [];
                list.forEach(function (sql_param) {
                    var temp = function (cb) {
                        var sql = sql_param.sql;
                        var param = sql_param.params;
                        connection.query(sql, param||[], function (tErr, rows, fields) {
                            if (tErr) {
                                connection.rollback(function () {
                                    throw tErr;
                                });
                            } else {
                                cb(null,rows);
                            }
                        })
                    };
                    funcAry.push(temp);
                });

                async.parallel(funcAry, function (err, result) {
                    if (err) {
                        connection.rollback(function (err2) {
                            connection.release();
                            // connection.destroy();\
                            reject(err2);
                        });
                    } else {
                        connection.commit(function (err2, info) {
                            if (err2) {
                                console.log("执行事务失败，" + err2);
                                connection.rollback(function (err3) {
                                    connection.release();
                                    // connection.destroy();
                                    reject(err3);
                                });
                            } else {
                                connection.release();
                                // connection.destroy();
                                resolve(result);
                            }
                        })
                    }
                });
            });
        }); 
    });
   
};

module.exports = onebyone;