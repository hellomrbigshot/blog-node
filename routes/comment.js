const express = require('express')
const router = express.Router()
const socketioJwt = require('socketio-jwt')
const { Server } = require('socket.io')
const io = new Server(8082, {
  transports: [
    'websocket',
    'flashsocket',
    'htmlfile',
    'xhr-polling',
    'jsonp-polling',
    'polling'
  ],
  cors: {
    origin: ['https://hellomrbigbigsho.xyz', 'http://localhost:3000'],
    credentials: true
  }
})
const schedule = require('node-schedule')
const { SECRET_KEY } = require('../config/config')

const CommentModel = require('../models/comment')
const ActivityModel = require('../models/activity')
const { checkLogin } = require('../middlewares/check')
const { cacheUser } = require('../cache/user')

// 创建评论
router.post('/create', checkLogin, async (req, res, next) => {
  const { content, create_user, page_id, page_title, to_user, reply_user, reply_content } = req.body
  const create_time = new Date()
  console.log(create_time)
  try {
    const result = await CommentModel.create({ content, create_user, page_id, page_title, to_user, create_time, reply_user, reply_content })
    console.log(result)
    // 添加一条动态
    await ActivityModel.create({ type: 'comment', id: result._id, create_time: result.create_time, create_user: result.create_user, update_time: result.create_time })
    res.status(200).json({ code: 'OK', data: result })
  } catch (e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
  }
})

// 获取文章评论列表
router.post('/getpagecommentlist', async (req, res, next) => {
  const { page_id } = req.body
  try {
    let result = await CommentModel.getCommentList({ type: 'page', content: page_id })
    res.status(200).json({ code: 'OK', data: result })
  } catch (e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
  }
})

// 获取用户评论列表
router.post('/getusercommentlist', checkLogin, async (req, res, next) => {
  const { type, create_user, to_user } = req.body
  const username = cacheUser.getUserName()
  let { pageSize = 10, page = 1 } = req.body
  pageSize = pageSize - 0
  page = page - 0
  const Count = pageSize * (page - 1)
  const content = type === 'create_user' ? create_user : to_user
  try {
    let [result, total] = await Promise.all([
      CommentModel.getCommentList({ type, content, pageSize, Count, username }),
      CommentModel.getCommentNum(type, type === 'create_user' ? create_user : to_user, username)
    ])
    res.status(200).json({ code: 'OK', data: { result, total } })
  } catch (e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
  }
})
router.post('/updatecommentstatus', checkLogin,  async (req, res, next) => {
  const { ids } = req.body
  try {
    if (!ids.length) {
      throw new Error('需要修改状态的评论列表不能为空')
    }
    await CommentModel.updateCommentsStatus(ids)
    res.status(200).json({ code: 'OK', data: '评论状态更新成功' })
  } catch (e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
  }
})
router.get('/getUnreadCommentNum', checkLogin, async (req, res, next) => {
  const USER = cacheUser.getUserName()
  try {
    let num = await CommentModel.getCommentNum('to_user', USER, USER, false)
    res.status(200).json({ code: 'OK', data: num })
  } catch(e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
  }
  
})
io.use(socketioJwt.authorize({
  secret: SECRET_KEY,
  handshake: true,
  timeout: '60000'
}))
io.on('connection', socket => {
  const comment_schedule = schedule.scheduleJob('*/10 * * * * *', async () => { /** 一分钟查询一次是否有新的回复/评论 **/
    const USER = socket.decoded_token.username
    if (USER !== undefined && USER !== null) { // 确认登录
      let num = await CommentModel.getCommentNum('to_user', USER, USER, false) // 获取未读的评论数量
      socket.emit('unread-comment', num)
    }
  })
})

module.exports = router
