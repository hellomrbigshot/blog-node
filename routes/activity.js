const router = require('express').Router()
const ActivityModel = require('../models/activity')
const PageModel = require('../models/page')
const CommentModel = require('../models/comment')

// 获取动态列表
router.post('/getlist', async (req, res, next) => {
    const type = req.body.type
    const create_user = req.body.create_user
    let page = req.body.page || 1
    let pageSize = req.body.pageSize || 10
    pageSize = typeof pageSize === 'number' ? pageSize : parseInt(pageSize)
    page = typeof page === 'number' ? page : parseInt(page)
    const Count = pageSize * (page - 1)
    let query_obj = {}
    if (type) query_obj.type = type
    if (create_user) query_obj.create_user = create_user
    try {
        let [result, total] = await Promise.all([
            ActivityModel.getList(Object.assign({ pageSize, Count }, query_obj)), 
            ActivityModel.getNum(query_obj)
        ])
        if (result.length) {
            result = await Promise.all(result.map(async item => {
                item = item.toObject()
                if (item.type === 'page') {
                    item.content = await PageModel.getPageById(item.id)
                } else if (item.type === 'comment') {
                    item.content = await CommentModel.getCommentById(item.id)
                }
                return item
            }))
        }
        res.status(200).json({ code: 'OK', data: { total, result } })
    } catch (e) {
        res.status(200).json({ code: 'ERROR', data: e.message })
    }
})
// 获取动态数量
router.post('/getnum', async (req, res, next) => {
    const type = req.body.type
    const create_user = req.body.create_user
    let query_obj = {}
    if (type) query_obj.type = type
    if (create_user) query_obj.create_user = create_user
    const result = await ActivityModel.getNum(query_obj)
    res.status(200).json({ code: 'OK', data: result })
})
module.exports = router