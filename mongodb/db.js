'use strict';

import mongoose from 'mongoose';
import config from 'config-lite';

mongoose.Promise = global.Promise;
mongoose.connect(config.url, {useMongoClient: true});

const db = mongoose.connection;

db.once('open' ,() => {
	console.log('连接数据成功')
})

db.on('error', function(error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});

db.on('close', function() {
    console.log('数据库断开，重新连接数据库');
    mongoose.connect(config.url, {useMongoClient: true});
});

export default db;
