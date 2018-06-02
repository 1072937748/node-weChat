'use strict';

import express from 'express'
import DialogModel from '../models/dialog'
import UserModel from '../models/user'
import ChatModel from '../models/singlechat'
const router = express.Router();
import logic from './logic'

router.get('/dialog', (req, res, next) => {
  const user_id = req.query.user_id;
  const listDate = [];
  logic(async () => {
    const UserData = await UserModel.findOne({
      id: user_id
    });
    if (UserData) { //对话列表
      for (let index = 0; index < UserData.dialog.length; index++) {
        const element = UserData.dialog[index];
        let eleInfo = await UserModel.findOne({
          id: element
        }, '-_id')
        const msgData = await ChatModel.find({
          $or: [{
            "from_id": element,
            "to_id": user_id
          }, {
            "from_id": user_id,
            "to_id": element
          }]
        }, '-_id content dialogtime').sort({
          id: -1
        });
        listDate.push({
          id: element,   // 好友id
          name: eleInfo.name,
          remarks: eleInfo.remarks,
          avatar: eleInfo.avatar,
          phone: eleInfo.phone,
          online: eleInfo.online,
          pinyin: eleInfo.pinyin,
          sdasd: eleInfo.sdasd,
          sex: eleInfo.sex,
          content: msgData.length ? msgData[0].content : '',
          dialogtime: msgData.length ? msgData[0].dialogtime : ''
        })
      }
      res.send({
        status: 200,
        data: listDate.reverse()
      })
    } else {
      res.send({
        status: 0,
        data: '用户未登录'
      })
    }
  })
})


router.get('/del', async (req, res, next) => {
  const user_id = req.session.user_id;
  const obj = req.body.data;
  logic(async () => {
    const dialogData = await DialogModel.findOne({
      user_id: user_id
    }, '-_id, -__v');
    if (dialogData) {
      res.send({
        status: 200,
        data: dialogData.list,
      })
    } else {
      res.send({
        status: 200,
        message: '您还没有聊天数据',
      })
    }
  })
})
export default router