'use strict';

import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const fcSchema = new Schema({
  id: {type: Number, required: true},
  avatar: String, 
  user_id: {type: Number, required: true},
  name: String,
  remarks: String, //备注
  statements: {type: String, required: true}, //内容
  time: {type: Number, required: true}, //时间
  suporthtml: String, //赞的人名
  like: Array, //赞的人名
  comment: Array
})

fcSchema.index({id: 1});

const Fcricle = mongoose.model('Fcricle', fcSchema)


export default Fcricle