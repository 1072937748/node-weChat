import express from 'express'
import GroupModel from '../models/group'
import UserModel from '../models/user'
import IDModel from '../models/id'
const router = express.Router();

// 群组列表
router.get('/all', async (req, res, next) => {
	const user_id = req.session.user_id;
	try {
		const targetUser = await UserModel.findOne({
			id: user_id
		})
		const group = targetUser.group;
		const data = [];
		// 查询房间信息
		for (let i = 0; i < group.length; i++) {
			const element = group[i];
			data.push(await GroupModel.findOne({
				id: element
			}))
		}
		res.send({
			status: 200,
			data,
		})
	} catch (err) {
		res.send({
			type: 'ERROR_TO_GET_USER_LIST',
			message: err.message
		})
	}
})

// 群组头像
router.get('/head', async (req, res, next) => {
	const room_id = req.query.data;
	try {
		const targetRoom = await GroupModel.findOne({
			id: room_id
		})
		const member_id = targetRoom.member_id.split(',');
		const data = [];
		// 查询房间信息
		for (let i = 0; i < member_id.length; i++) {
			const element = member_id[i];
			let userData = await UserModel.findOne({
				id: element
			});
			data.push(userData)
		}
		res.send({
			status: 200,
			data,
		})
	} catch (err) {
		res.send({
			type: 'ERROR_TO_GET_USER_LIST',
			message: err.message
		})
	}
})

// 创建群组
router.post('/create', async (req, res, next) => {
	const data = req.body.data;
	const member_id = data.sort((a, b) => { //用户id排序，方便对比
		return a - b
	}).toString();

	try {
		let isCreated = await GroupModel.findOne({
			member_id,
		})
		if (isCreated) { //已经创建该房间
			console.log('已经创建该房间')
			res.send({
				status: 200,
				data: isCreated
			})
			return;
		}
		const ID = await IDModel.findOne()
		ID.group_id++;

		let room = ''; //房间名
		//更新用户群组列表 (添加)
		for (let index = 0; index < data.length; index++) {
			const element = data[index];
			let userData = await UserModel.findOne({
				id: element
			})
			userData.group.push(ID.group_id);
			userData.group = [...new Set(userData.group)];
			room += ((userData.remarks || userData.name) + ','); //房间名为所有人的名字拼接
			userData.save();
		}
		room = room.substr(0, room.length - 1);
		// 群聊表添加记录
		await ID.save();
		let createObj = {
			name: room[10] ? room.slice(0, 10) + '...' : room,
			id: ID.group_id,
			member_id
		};
		await GroupModel.create(createObj)
		res.send({
			status: 200,
			data: createObj
		})
	} catch (error) {
		console.log(error.message)
		res.send({
			type: 'ERROR_TO_GET_USER_LIST',
			message: error.message
		})
	}
})

// 退出群组
router.get('/leave', async (req, res, next) => {
	const data = req.query
	let {
		user_id,
		room_id
	} = data;
	console.log(data)

	try {
		let userData = await UserModel.findOne({
			id: user_id
		})
		let groupData = await GroupModel.findOne({
			id: room_id
		})
		userData.group.splice(userData.group.indexOf(room_id), 1)
		const member = groupData.member_id.split(',');
		member.splice(member.indexOf(user_id), 1)
		groupData.member_id = member.join(',')
		userData.save()
		groupData.save()
		res.send({
			status: 200
		})
	} catch (error) {
		res.send({
			type: 'ERROR_TO_GET_USER_LIST',
			message: error.message
		})
	}
})

// 加入群组（暂无）



export default router