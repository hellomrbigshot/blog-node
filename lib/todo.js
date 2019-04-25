const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TodoSchema = new Schema({
  create_user: { type: String }, // 创建人
  create_time: { type: Date, default: Date.now }, // 创建时间
  completed_time: { type: Date }, // 完成时间
  expected_time: { type: Date }, // 期望完成时间
  status: { type: String }, // 状态
  content: { type: String } // 内容
})

exports.Todo = mongoose.model('Todo', TodoSchema)