var config = {
	port : 5500,//端口
	mysql :  {
		host : '127.0.0.1',
		port : '3306',
		user : 'root',
		password : 'root',
		database : 'items',
        connectTimeout: 10000,
        acquireTimeout: 4000,
        connectionLimit : 100
	}
};
module.exports = config;