const express = require('express')
const router = express.Router()
const io = require('socket.io').listen('8082', { origins: '*' })
const schedule = require('node-schedule')

const CommentModel = require('../models/comment')
const ActivityModel = require('../models/activity')
const { checkLogin } = require('../middlewares/check')
const { cacheUser } = require('../cache/user')

io.set('transports', [
  'websocket',
  'flashsocket',
  'htmlfile',
  'xhr-polling',
  'jsonp-polling',
  'polling'
])
io.set('origins', '*:*')

// 创建评论
router.post('/create', checkLogin, async (req, res, next) => {
  const content = req.body.content
  const create_user = req.body.create_user
  const page_id = req.body.page_id
  const page_title = req.body.page_title
  const to_user = req.body.to_user
  const reply_user = req.body.reply_user
  const reply_content = req.body.reply_content
  const create_time = new Date().toLocaleString()
  try {
    const result = await CommentModel.create({ content, create_user, page_id, page_title, to_user, create_time, reply_user, reply_content })
    // 添加一条动态
    await ActivityModel.create({ type: 'comment', id: result._id, create_time: result.create_time, create_user: result.create_user, update_time: result.create_time })
    res.status(200).json({ code: 'OK', data: result })
  } catch (e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
  }
})

// 获取文章评论列表
router.post('/getpagecommentlist', async (req, res, next) => {
  const page_id = req.body.page_id
  try {
    let result = await CommentModel.getCommentList({ type: 'page', content: page_id })
    res.status(200).json({ code: 'OK', data: result })
  } catch (e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
  }
})

// 获取用户评论列表
router.post('/getusercommentlist', checkLogin, async (req, res, next) => {
  const type = req.body.type
  const create_user = req.body.create_user
  const to_user = req.body.to_user
  const username = cacheUser.getUserName()
  let pageSize = req.body.pageSize || 10
  let page = req.body.page || 1
  pageSize = typeof pageSize === 'number' ? pageSize : parseInt(pageSize)
  page = typeof page === 'number' ? page : parseInt(page)
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
  const ids = req.body.ids
  try {
    if (!ids.length) {
      throw new Error('需要修改状态的评论列表不能为空')
    }
    let result = await CommentModel.updateCommentsStatus(ids)
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
io.on('connect', (socket) => {
  const comment_schedule = schedule.scheduleJob('*/10 * * * * *', async () => { /** 一分钟查询一次是否有新的回复/评论 **/
    const USER = global.user
    if (USER !== undefined && USER !== null) { // 确认登录
      let num = await CommentModel.getCommentNum('to_user', USER, USER, false) // 获取未读的评论数量
      socket.emit('unread-comment', num)
    }
  })
})


function getCookie (str, key) {
  const REG = /([^=]+)=([^;]+);?\s*/g
  let cookie_obj = {}, result
  while((result = REG.exec(str)) != null) {
    cookie_obj[result[1]] = result[2];
  }
  if (cookie_obj[key] === undefined) {
    return undefined
  }
  return cookie_obj[key]
}

module.exports = router
