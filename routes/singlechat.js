'use strict';

import express from 'express'
import ChatModel from '../models/singlechat'
const router = express.Router()

router.post('/history', async (req, res, next) => {
	const {
		limit = 20, offset = 0, from_id, to_id
	} = req.body;
	try {
		const history = await ChatModel.find({
			$or: [{
				from_id,
				to_id
			}, {
				"from_id": to_id,
				"to_id": from_id,
				"unread": false
			}]
		}, '-_id').sort({
			id: -1
		}).skip(Number(offset)).limit(Number(limit));
		res.send({
			status: 200,
			history: history.reverse(),
		})
	} catch (err) {
		console.log('获取聊天记录失败', err.message);
		res.send({
			status: 0,
			message: '获取聊天记录失败'
		})
	}
})

export default router