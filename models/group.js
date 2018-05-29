'use strict';

import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const groupSchema = new Schema({
	name: String,
	id: Number,
	manager_id: Number,
	member_id: String,
	avatar: { // 头像
		type: String,
		default: 'group' + Math.floor(Math.random() * 9 + 1) + '.jpg'
	},
	message: { //群聊信息列表
		type: Array,
		default: []
	},
	public: String
})

groupSchema.index({
	id: 1
}) //给字段设置索引

const Group = mongoose.model('Group', groupSchema);

export default Group