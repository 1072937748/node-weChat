'use strict';

import express from 'express'
import FcModel from '../models/fcricle'
import UserModel from '../models/user'
import IDModel from '../models/id'
const router = express.Router()

// 查询朋友圈(暂无分页)
router.get('/select', async (req, res, next) => {
  const {
    limit = 20, offset = 0, user_id = req.session.user_id, name
  } = req.query;

  try {
    let users = await UserModel.findOne({
      id: user_id
    })
    users = [...users.friends, user_id];
    const fcData = await FcModel.find({
      user_id: {
        $in: users
      }
    }, '-_id -__v').sort({
      id: -1
    }).skip(Number(offset)).limit(Number(limit));
    fcData.forEach(item => {
      // 初始化数据
      Object.assign(item, {
        suporthtml: item.like.includes(name) ? "取消" : "赞", // 是否已经赞过
        reviewshow: false,
        reviewhide: false,
        criticism: false,
        flag: true, // 控制动画出现
      })
    })
    res.send({
      status: 200,
      data: fcData,
    })
  } catch (err) {
    console.log('获取朋友圈失败', err);
    res.send({
      status: 0,
      message: '获取朋友圈失败'
    })
  }
})

// 查询朋友圈(暂无分页)
router.get('/selectSelf', async (req, res, next) => {
  const {
    limit = 80, offset = 0, user_id = req.session.user_id, name
  } = req.query;

  const data = [];
  try {
    const fcData = await FcModel.find({
      user_id
    }, '-_id -__v').sort({
      id: -1
    }).skip(Number(offset)).limit(Number(limit));
    // 组装数据
    fcData.forEach(item => {
      let time = dtime(item.time).format("MM月-DD").split('-') // ['05月','18']
      let element = data.find(i => {
        return i.albummonth == time[0] || i.albumday == time[1]
      })
      if (element) {
        element.puretext.push(item.statements)
      } else {
        data.push({
          albummonth: time[0],
          albumday: time[1],
          puretext: [item.statements]
        })
      }
    })
    res.send({
      status: 200,
      data,
    })
  } catch (err) {
    console.log('获取动态失败', err);
    res.send({
      status: 0,
      message: err.message
    })
  }
})

// 发朋友圈(暂无分页)
router.get('/add', async (req, res, next) => {
  const {
    user_id,
    avatar,
    name = '',
    remarks = '',
    statements,
  } = req.query;
  try {
    let ID = await IDModel.findOne();
    ID.fcricle_id++

      const fcObj = {
        id: ID.fcricle_id,
        avatar,
        user_id,
        name,
        like: [],
        comment: [],
        remarks, //备注名
        statements, //内容
        time: Number(dtime().format('x')), //时间
      };
    await FcModel.create(fcObj)
    ID.save()
    res.send({
      status: 200,
      data: fcObj,
    })
  } catch (err) {
    console.log('保存朋友圈失败', err.message);
    res.send({
      status: 0,
      message: err.message
    })
  }
})

// 更新朋友圈(暂无分页)
router.post('/update', async (req, res, next) => {
  let data = req.body;
  data.like ? '' : data.like = [];
  const {
    user_id,
    avatar,
    name = '',
    remarks = '',
    statements,
  } = req.query;
  try {
    let fcData = await FcModel.findOne({
      id: data.id
    })
    Object.assign(fcData, data).save()
    res.send({
      status: 200,
    })
  } catch (err) {
    console.log('保存朋友圈失败', err.message);
    res.send({
      status: 0,
      message: err.message
    })
  }
})

export default router