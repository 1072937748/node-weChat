import express from 'express'
import UserModel from '../models/user.js'
import IDModel from '../models/id.js'
const router = express.Router();

// 注册
router.get('/register', async (req, res, next) => {
	const username = req.query.username;
	const password = req.query.password;
	if (!username || !password) {
		res.send({
			status: 0,
			message: '账号和密码不能为空'
		})
		return
	}
	try {
		const userData = await UserModel.findOne({
			name: username
		}, '-_id');
		if (userData) {
			res.send({
				status: 0,
				message: '该账号已存在'
			})
		} else {
			const ID = await IDModel.findOne()
			ID.user_id++;
			await ID.save()
			await UserModel.create({
				name: username,
				pinyin: pinyin(username),
				id: ID.user_id,
				password: password,
				phone: username,
				remarks: username,
				online: true
			});
			const userData = await UserModel.findOne({
				name: username
			}, '-_id');
			req.session.user_id = ID.user_id;
			res.send({
				status: 200,
				message: '注册成功',
				user_info: userData
			})
		}
	} catch (err) {
		console.log(err)
		res.send({
			status: 0,
			message: err
		})
	}
})

// 登录
router.get('/login', async (req, res, next) => {
	const username = req.query.username.toString();
	const password = req.query.password.toString();
	try {
		let userData = await UserModel.findOne({
			name: username,
			password
		}, '-_id -password -__v');
		console.log('before',userData)
		userData.online = true;
		console.log('online',userData.setter)
		await userData.save();
		console.log('await')
		if (userData) {
			req.session.user_id = userData.id;
			res.send({
				status: 200,
				user_info: userData
			})
		} else {
			res.send({
				status: 0,
				message: '账号或密码错误'
			})
		}
	} catch (err) {
		console.log(err)
		res.send({
			status: 0,
			message: err.message,
		})
	}
})

// 退出
router.post('/logOut', async (req, res, next) => {
	const id = req.session.user_id;
	let userData = await UserModel.findOne({
		id
	})
	userData.online = false;
	await userData.save()
	try {
		delete req.session.user_id;
		res.send({
			status: 200,
			message: '退出成功'
		})
	} catch (err) {
		res.send({
			status: 0,
			message: err.message,
		})
	}
})

// 用户信息
router.get('/info', async (req, res, next) => {
	const user_id = Number(req.query.user_id);
	req.session.user_id ? false : req.session.user_id = user_id;
	if (!user_id) {
		res.send({
			status: 0,
			message: '请登陆'
		})
		return
	}
	try {
		const userData = await UserModel.findOne({
			id: user_id
		}, '-_id');
		if (userData) {
			res.send({
				status: 200,
				user_info: userData
			})
		} else {
			res.send({
				status: 0,
				message: '未找到当前用户'
			})
		}
	} catch (err) {
		console.log(err.message)
		res.send({
			status: 0,
			message: '获取用户信息失败' + err.message
		})
	}
})

// 更新用户信息
router.post('/update', async (req, res, next) => {
	const user_id = Number(req.body.id || null);
	if (!user_id) {
		res.send({
			status: 0,
			message: '缺少用户ID'
		})
	} else {
		try {
			const userData = await UserModel.findOne({
				id: user_id
			});
			if (userData) {
				const newData = Object.assign(userData, req.body);
				newData.pinyin = pinyin(newData.remarks || newData.name)
				newData.save()
				res.send({
					status: 200,
					user_info: newData
				})
			} else {
				res.send({
					status: 0,
					message: '未找到当前用户'
				})
			}
		} catch (err) {
			res.send({
				status: 0,
				message: err
			})
		}
	}
})

// 通讯录列表
router.get('/all', async (req, res, next) => {
	const user_id = req.session.user_id;
	let users = {
		'#': [],
		Z: [],
		Y: [],
		X: [],
		W: [],
		V: [],
		U: [],
		T: [],
		S: [],
		R: [],
		Q: [],
		P: [],
		O: [],
		N: [],
		M: [],
		L: [],
		K: [],
		J: [],
		I: [],
		H: [],
		G: [],
		F: [],
		E: [],
		D: [],
		C: [],
		B: [],
		A: [],
	};
	try {
		const targetUser = await UserModel.findOne({
			id: user_id
		})
		const friends = targetUser.friends;
		const data = [];
		for (let i = 0; i < friends.length; i++) {
			const element = friends[i];
			data.push(await UserModel.findOne({
				id: element
			}))
		}
		data.forEach((item, i) => {
			const letter = item.pinyin[0].toLocaleUpperCase()
			if (users.hasOwnProperty(letter)) {
				users[letter].push(item)
			} else {
				users['#'].push(item)
			}
		})
		res.send({
			status: 200,
			users,
		})
	} catch (err) {
		res.send({
			type: 'ERROR_TO_GET_USER_LIST',
			message: err.message
		})
	}
})

// 对话列表
router.post('/dialog', async (req, res, next) => {
	const user_id = Number(req.body.id || null);
	if (!user_id) {
		res.send({
			status: 0,
			message: '缺少用户ID'
		})
	} else {
		try {
			const userData = await UserModel.findOne({
				id: user_id
			});
			if (userData) {
				const newData = Object.assign(userData, req.body);
				newData.save((err) => {
					err ? console.log(err) : false;
				})
				res.send({
					status: 200,
					user_info: newData
				})
			} else {
				res.send({
					status: 0,
					message: '未找到当前用户'
				})
			}
		} catch (err) {
			res.send({
				status: 0,
				message: err
			})
		}
	}
})

// 通讯录列表
router.get('/search', async (req, res, next) => {
	const phone = req.query.phone;
	try {
		const user = await UserModel.findOne({
			phone
		})
		res.send({
			status: 200,
			data: user,
		})
	} catch (err) {
		res.send({
			type: 'ERROR_TO_GET_USER_LIST',
			message: err.message
		})
	}
})

// 添加好友
router.get('/addfriend', async (req, res, next) => {
	const {
		id,
		friend
	} = req.query;
	if (id == req.session.user_id) {
		return
	}
	try {
		const userData = await UserModel.findOne({
			id
		})
		const friendData = await UserModel.findOne({
			id: friend
		})
		userData.friends = [...new Set([...userData.friends, Number(friend)])]
		friendData.friends = [...new Set([...friendData.friends, Number(id)])]
		userData.save()
		friendData.save()
		res.send({
			status: 200,
		})
	} catch (err) {
		res.send({
			type: 'ERROR_TO_GET_USER_LIST',
			message: err.message
		})
	}
})

// 更换壁纸
router.get('/wall', async (req, res, next) => {
	const {
		id,
		url
	} = req.query;
	try {
		const userData = await UserModel.findOne({
			id
		})
		userData.wall = url;
		userData.save()
		res.send({
			status: 200,
		})
	} catch (err) {
		res.send({
			message: err.message
		})
	}
})

export default router