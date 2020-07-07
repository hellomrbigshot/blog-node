const express = require('express')
const router = express.Router()

const PageModel = require('../models/page')
const ActivityModel = require('../models/activity')
const { checkLogin } = require('../middlewares/check')
const { cacheUser } = require('../cache/user')

router.post('/new', checkLogin, async (req, res) => {
  // 新建文章
  try {
    const { title, content, status, secret, tags } = req.body
    const create_time = new Date().toLocaleString()
    const update_time = new Date().toLocaleString()
    const create_user = cacheUser.getUserName()
    let page = {
      title,
      tags,
      content,
      create_user,
      create_time,
      update_time,
      status,
      secret,
    }
    const result = await PageModel.create(page)
    await ActivityModel.create({
      type: 'page',
      id: result._id,
      create_time: result.create_time,
      update_time: result.update_time,
      create_user: result.create_user,
    })

    const [page_num, draft_num] = await Promise.all([
      PageModel.getPageNum({
        type: 'create_user',
        content: create_user,
        status: 'normal',
      }),
      PageModel.getPageNum({
        type: 'create_user',
        content: create_user,
        status: 'draft',
      }),
    ])
    res
      .status(200)
      .json({ code: 'OK', data: { page_num, draft_num, id: result._id } })
  } catch (e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
  }
})
router.post('/edit', checkLogin, async (req, res) => {
  // 编辑文章
  try {
    const { id, title, content, status, secret, tags } = req.body
    const update_time = new Date()
    const create_user = cacheUser.getUserName()
    let page = {
      title,
      content,
      update_time,
      status,
      secret,
      tags,
    }
    const result = await PageModel.update(id, page)
    await ActivityModel.create({
      type: 'page',
      id: result._id,
      create_time: result.create_time,
      update_time: result.update_time,
      create_user: result.create_user,
    })
    const [page_num, draft_num] = await Promise.all([
      PageModel.getPageNum({
        type: 'create_user',
        content: create_user,
        status: 'normal',
      }),
      PageModel.getPageNum({
        type: 'create_user',
        content: create_user,
        status: 'draft',
      }),
    ])
    res.status(200).json({ code: 'OK', data: { page_num, draft_num, id } })
  } catch (e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
  }
})
router.post('/detail', async (req, res, next) => {
  // 获取文章详情
  try {
    const { id } = req.body
    let result = await PageModel.getPageById(id)
    result.content = result.content.replace('<--阅读全文-->', '')
    res.status(200).json({ code: 'OK', data: result })
  } catch (e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
  }
})
/**
 * @param {number} req.body.pageSize
 * @param {number} req.body.pag
 * @param {number} req.body.type
 * @param {number} req.body.content
 * @param {number} req.body.status
 * @param {number} req.body.secret
 */
router.post('/pagelist', async (req, res, next) => {
  // 获取文章列表
  let { pageSize = 10, page = 1 } = req.body
  const { type, content, status, secret, sort = 'create_time' } = req.body
  pageSize = pageSize - 0
  page = page - 0
  const Count = pageSize * (page - 1)
  try {
    let [total, result] = await Promise.all([
      PageModel.getPageNum({ type, content, status, secret }),
      PageModel.getPageList({
        type,
        content,
        status,
        pageSize,
        Count,
        secret,
        sort,
      }),
    ])
    const splitStr = '<--阅读全文-->'
    result = result.map((item) => {
      item = item.toObject()
      if (item.content.includes(splitStr)) {
        item.showMore = true
        item.content = item.content.split(splitStr)[0]
      }
      return item
    })
    res.status(200).json({ code: 'OK', data: { result, total } })
  } catch (e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
  }
})
router.post('/searchpage', async (req, res, next) => {
  // 模糊搜索
  let { keywords = '', page = 1, pageSize = 999 } = req.body
  pageSize = pageSize - 0
  page = page - 0
  const Count = pageSize * (page - 1)
  try {
    let [total, result] = await Promise.all([
      PageModel.searchPageNum({ keywords }),
      PageModel.searchPage({ keywords, Count, pageSize }),
    ])
    result = result.map((item) => {
      item = item.toObject()
      item.content = item.content.replace('<--阅读全文-->', '')
      return item
    })
    res.status(200).json({ code: 'OK', data: { result, total } })
  } catch (e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
  }
})
router.post('/limitpagelist', checkLogin, async (req, res, next) => {
  // 根据条件获取文章列表，必须登录
  const { type, content, status, secret, sort = 'create_time' } = req.body
  let { pageSize = 10, page = 1 } = req.body
  pageSize = pageSize - 0
  page = page - 0
  const Count = pageSize * (page - 1)
  try {
    let [total, result] = await Promise.all([
      PageModel.getPageNum({ type, content, status, secret }),
      PageModel.getPageList({
        type,
        content,
        status,
        pageSize,
        Count,
        secret,
        sort,
      }),
    ])
    result = result.map((item) => {
      item = item.toObject()
      item.content = item.content.replace('<--阅读全文-->', '')
      return item
    })
    res.status(200).json({ code: 'OK', data: { result, total } })
  } catch (e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
  }
})

router.post('/addcomment', checkLogin, async (req, res, next) => {
  // 保存评论
  const { comment, create_user, id } = req.body
  const create_time = new Date()
  try {
    let total = await PageModel.addPageComment(id, {
      comment,
      create_user,
      create_time,
    })
    res.status(200).json({ code: 'OK', data: '留言提交成功!' })
  } catch (e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
  }
})
router.post('/getcomments', async (req, res, next) => {
  const { id } = req.body
  try {
    let comments = (await PageModel.getPageById(id)).comments
    res.status(200).json({ code: 'OK', data: { result: comments } })
  } catch (e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
  }
})
module.exports = router
