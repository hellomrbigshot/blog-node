const sha1 = require('sha1')
const express = require('express')
const router = express.Router()

const UserModel = require('../models/user')
const { checkLogin } = require('../middlewares/check')

// POST 用户列表
router.post('/list', checkLogin, (req, res, next) => {
  let { pageSize, page } = req.body
  pageSize = pageSize - 0
  page = page - 0
  UserModel.getUserNum()
    .then((num) => {
      UserModel.getUserList(pageSize, (page - 1) * pageSize)
        .then((userList) => {
          let list = userList.map((user) => {
            delete user.password
            return user
          })
          res
            .status(200)
            .json({ code: 'OK', data: { list: list, total_num: num } })
        })
        .catch((e) => {
          res.status(200).json({ code: 'ERROR', data: e })
        })
    })
    .catch((e) => {
      res.status(200).json({ code: 'ERROR', data: e })
    })
})
// POST 用户详情
router.post('/detail', (req, res, next) => {
  const { username } = req.body
  UserModel.getUserByName(username)
    .then((user) => {
      let result = JSON.parse(JSON.stringify(user))
      delete result.password
      res.status(200).json({ code: 'OK', data: result })
    })
    .catch((e) => {
      res.status(200).json({ code: 'ERROR', data: e })
    })
})

// POST 编辑用户个人简介
router.post('/updatebio', checkLogin, (req, res, next) => {
  const { username, bio } = req.body
  UserModel.updateBio({ username, bio })
    .then((user) => {
      if (user) {
        res.status(200).json({ code: 'OK', data: '保存成功' })
      }
    })
    .catch((e) => {
      res.status(200).json({ code: 'ERROR', data: e })
    })
})
module.exports = router
