const router = require('express').Router()
const TodoModel = require('../models/todo')
const { checkLogin } = require('../middlewares/check')
const { cacheUser } = require('../cache/user')

router.post('/create', checkLogin, async (req, res, next) => {
  const { content, expected_time } = req.body
  const create_time = new Date().toLocaleString()
  const status = 'pending'
  const completed_time = ''
  const create_user = cacheUser.getUserName()
  try {
    const result = await TodoModel.create({ content, expected_time: expected_time || '', status, completed_time, create_time, create_user })
    res.status(200).json({ code: 'OK', data: result })
  } catch (e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
  }
})
router.post('/updateTodoStatus', checkLogin, async (req, res, next) => {
  const { id, status } = req.body
  try {
    const result = await TodoModel.updateTodoStatus(id, status)
    res.status(200).json({ code: 'OK', data: result })
  } catch (e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
  }
})
router.post('/getTodoList', checkLogin, async (req, res, next) => {
  const create_user = cacheUser.getUserName()
  try {
    const result = await TodoModel.getTodoList(create_user)
    res.status(200).json({ code: 'OK', data: result })
  } catch (e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
  }
})
module.exports = router