const Todo = require('../lib/todo').Todo

module.exports = {
  // 创建 todo
  create(todo) {
    return Todo.create(todo)
  },
  // 获取 todo 列表
  getTodoList(create_user) {
    return Todo
      .find({ create_user })
      .sort({ 'create_time': -1 })
      .exec()
  },
  updateTodoStatus(id, status) {
    const condition = { _id: id }
    let update_obj = { status }
    if (status === 'completed') {
      update_obj.complete_time = new Date()
    }
    return Todo.
      update(condition, { $set: update_obj })
      .exec()
  }
}
