'use strict';

import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const userSchema = new Schema({
	name: String,
	pinyin: String,
	id: Number,
	password: String,
	avatar: {type: String, default: 'https://raw.githubusercontent.com/1072937748/pictures/master/default' + Math.floor(Math.random() * 9 + 1) + '.jpg'}, // 头像
	phone: String,
	online: {type: Number, default: 0}, //在线状态
	district: String, //地址
	sex: {type: String, default: '0'},
	sdasd: {type: String, default: '懒得说...'}, //个性签名
	remarks: String, //备注
	dialog: {type: Array, default: []}, //对话列表
	group: {type:Array, default: []},  //群聊列表
	friends: {type:Array, default: []}, //好友列表
	wall: String, //朋友圈背景墙
})

userSchema.index({id: 1})	//给字段设置索引

const User = mongoose.model('User', userSchema);

export default User