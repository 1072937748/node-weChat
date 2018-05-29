'use strict';

import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const DialogSchema = new Schema({
  user_id: Number,
  id: Number,
  list: Array
})

DialogSchema.index({
  id: 1
}) //给字段设置索引

const Dialog = mongoose.model('Dialog', DialogSchema);

export default Dialog