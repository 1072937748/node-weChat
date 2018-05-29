'use strict';

import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const chatSchema = new Schema({
	id: Number,
	from_id: Number,
	to_id: Number,
	time: String,
	dialogtime: String,
	avatar: String,
	content: String,
	unread: {
		type: Boolean,
		default: true
	},
})

chatSchema.index({
	id: 1
});

const singleChat = mongoose.model('singleChat', chatSchema)


export default singleChat