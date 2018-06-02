import config from 'config-lite';
import db from './mongodb/db.js';
import history from 'connect-history-api-fallback';
import connectMongo from 'connect-mongo';
import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import ChatModel from './models/chat.js';
import GroupModel from './models/group';
import IDModel from './models/id.js';
import SingleModel from './models/singlechat';
import UserModel from './models/user.js';
import router from './routes/index.js';
import User from './models/user.js';
const app = express()
const _ = require('underscore');
const server = require('http').Server(app);
const io = require('socket.io')(server);
// const cors = require('cors');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());


// app.use(cors)
app.all('*', (req, res, next) => {
	res.header("Access-Control-Allow-Origin", req.headers.origin);
	res.header("Access-Control-Allow-Credentials", true); //可以带cookies
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By", '3.2.1')
	if (req.method == 'OPTIONS') {
		res.send(200);
	} else {
		next();
	}
});


const MongoStore = connectMongo(session);
app.use(cookieParser());
app.use(session({
	name: config.session.name,
	secret: config.session.secret,
	resave: true,
	saveUninitialized: false,
	cookie: config.session.cookie,
	store: new MongoStore({
		url: config.url
	})
}))

const users = {};
io.on('connection', socket => {
	// 设置身份
	socket.on("setInfo", async (msg) => {
		console.log('设置身份', msg);
		socket.clientID = msg;

		// 重新发送离线消息
		let data = await SingleModel.find({
			to_id: Number(msg),
			unread: true
		})
		socket.emit('unreadMsg', data)

		//进入群组
		let userData = await UserModel.findOne({
			id: msg
		})
		userData.group.forEach(element => {
			socket.join(element)
		});
		userData.online = true;
		await userData.save((err, data) => {
			console.log(data)
		})
	})

	// 创建房间
	socket.on("createGroup", async (data) => {
		try {
			for (const key in io.sockets.sockets) {
				if (io.sockets.sockets.hasOwnProperty(key)) {
					const element = io.sockets.sockets[key];
					if (data.data.includes(element.clientID)) { //在线用户加入房间
						element.join(data.room_id)
					}
				}
			}
		} catch (error) {
			console.log(error.message)
		}
	})

	// 退出房间
	socket.on("leaveGroup", async data => {
		console.log('退出房间' + data)
		try {
			socket.leave(data)
		} catch (error) {
			console.log(error.message)
			socket.error(error.message)
		}
	})

	// 进入群聊
	socket.on("enterGroup", (msg) => {
		console.log(msg.name, '进入聊天室')
		socket.broadcast.emit("enter", msg.name + '进入聊天室')
	})

	//退出群聊
	socket.on("removeGroup", (msg) => {
		console.log(msg.name, '退出聊天室')
	})

	// 群聊消息
	socket.on("groupchat", async (msg) => {
		let {
			room_id,
			user_id,
			content
		} = msg;
		content = content.trim();
		console.log(msg)
		try {
			if (!user_id) {
				throw new Error('用户ID参数错误')
			} else if (!content) {
				throw new Error('发表对话信息错误')
			}
		} catch (err) {
			console.log(err.message, err);
		}
		// content = content.substring(0, 100);
		let chatObj;
		try {
			const user = await UserModel.findOne({
				id: user_id
			});
			const ID = await IDModel.findOne()
			ID.chat_id++;
			await ID.save()
			chatObj = {
				id: ID.chat_id,
				room_id,
				username: user.name,
				avatar: user.avatar,
				user_id,
				time: dtime().format('YYYY-MM-DD HH:mm:ss'),
				content,
			}
			await ChatModel.create(chatObj)
		} catch (err) {
			console.log('保存聊天数据失败', err);
		}
		const groupData = await GroupModel.findOne({
			id: room_id
		})
		io.in(String(room_id)).emit('groupchat', Object.assign({}, chatObj, {
			groupavatar: groupData.avatar
		}));
	});

	// 私聊
	socket.on("singlechat", async (data) => {
		let {
			to_id,
			from_id,
			avatar,
			content
		} = data;
		content = content.trim();
		try {
			if (!from_id) {
				socket.error('发送者ID为空')
				return
			} else if (!content) {
				socket.error('发表对话信息错误')
				return
			}
		} catch (err) {
			console.log(err.message, err);
		}
		content = content.substring(0, 100);
		let chatObj;
		// 对方是否在线;
		let status = false;

		// 更新用户对话列表
		try {
			let from_user = await UserModel.findOne({
				id: from_id
			})
			let to_user = await UserModel.findOne({
				id: to_id
			})
			from_user.dialog.push(to_id)
			to_user.dialog.push(from_id)
			from_user.dialog = [...new Set(from_user.dialog)]
			to_user.dialog = [...new Set(to_user.dialog)]

			from_user.save()
			to_user.save()
		} catch (err) {
			console.log('更新用户对话列表,' + err.message)
		}

		for (const key in io.sockets.sockets) {
			if (io.sockets.sockets.hasOwnProperty(key)) {
				const element = io.sockets.sockets[key];
				if (element.clientID == to_id) {
					status = true;
					data.dialogtime = dtime().format('HH:mm');
					element.emit('allchat', data)
				}
			}
		}

		// 保存私聊消息(不在线就存为离线信息)
		try {
			const ID = await IDModel.findOne()
			ID.singlechat_id++;
			await ID.save()
			chatObj = {
				id: ID.singlechat_id,
				from_id,
				to_id,
				avatar,
				time: dtime().format('YYYY-MM-DD HH:mm:ss'),
				dialogtime: dtime().format('HH:mm'),
				content,
			}
			if (!status) {
				socket.error('对方不在线哟')
			}
			await SingleModel.create(chatObj)
		} catch (error) {
			console.log('保存私聊消息,' + error.message)
		}
	});

	//更新私聊为已读
	socket.on("updatechat", async (data) => {
		try {
			let target = await SingleModel.findOne({
				to_id: Number(data.to_id),
				unread: true
			});
			target.unread = false;
			target.save();
		} catch (error) {
			console.log(error.message)
		}
	})

	// 朋友圈更新
	socket.on('updatefc', async user_id => {
		let users = await UserModel.findOne({
			id: user_id
		})
		users = [...users.friends]
		console.log(users)
		// 通知给朋友
		for (const key in io.sockets.sockets) {
			if (io.sockets.sockets.hasOwnProperty(key)) {
				const element = io.sockets.sockets[key];
				if (users.includes(element.clientID)) {
					console.log(element.clientID)
					element.emit('fcricle', user_id)
				}
			}
		}
	})
	// 赞或评论
	socket.on('zanOrCom', (user_id, type) => {
		// 通知给朋友
		for (const key in io.sockets.sockets) {
			if (io.sockets.sockets.hasOwnProperty(key)) {
				const element = io.sockets.sockets[key];
				if (element.clientID == user_id) {
					element.emit('fcricle', user_id, type)
				}
			}
		}
	})
	socket.on("disconnect", async (msg) => {
		console.log(socket.clientID, '离线')
		let userData = await UserModel.findOne({
			id: socket.clientID
		})
		userData.online = false;
		await userData.save()
	})
});

router(app)
app.use(history());
app.use(express.static('./public'));
server.listen(config.port);