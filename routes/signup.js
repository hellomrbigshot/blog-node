const express = require('express')
const sha1 = require('sha1')
const router = express.Router()

const UserModel = require('../models/user')
// const FileModel = require('../models/file')
// const multer = require('../models/multerUtil')
const { initToken } = require('../utils/jwt')

// POST /signup 用户注册
router.post('/', async (req, res) => {
  const { username, repassword, avatar = '', gender = 'x', bio } = req.body
  let { password } = req.body
  // 校验参数
  try {
    if (!(username.length > 1 && username.length < 10)) {
      throw new Error('用户名请限制在1到10个字符')
    }
    if (['m', 'f', 'x'].indexOf(gender) === -1) {
      throw new Error('性别选择错误')
    }
    if (password.length < 6) {
      throw new Error('密码至少为6个字符')
    }
    if (password !== repassword) {
      throw new Error('两次密码输入不一致')
    }
  } catch (e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
    return false
  }
  try {
    let exist = await UserModel.getUserByName(username)
    if (exist) {
      throw new Error('该用户已注册')
    }
    // 密码加密
    password = sha1(password)
    // 待写入数据库的用户信息
    let user = {
      username,
      password,
      avatar,
      gender,
      bio
    }
    // 用户信息写入数据库
    await UserModel.create(user)
  
    const tokenInfo = initToken(username)
    res.status(200).json({ code: 'OK', data: tokenInfo })
  } catch (e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
    return false
  }
})

// 第三方登录 注册
router.post('/oauth', async (req, res, next) => {
  const { username, repassword, gender, bio } = req.body
  let { password } = req.body
  const oauthinfo = [req.body.oauthinfo]
  // 校验参数
  try {
    if (!(username.length > 1 && username.length < 10)) {
      throw new Error('用户名请限制在1到10个字符')
    }
    // if (['m', 'f', 'x'].indexOf(gender) === -1) {
    //     throw new Error('性别选择错误')
    // }
    if (password.length < 6) {
      throw new Error('密码至少为6个字符')
    }
    if (password !== repassword) {
      throw new Error('两次密码输入不一致')
    }
    let exist = await UserModel.getUserByName(username)
    if (exist) {
      throw new Error('该用户已注册')
      return false
    }
    // 密码加密
    password = sha1(password)

    // 待写入数据库的用户信息
    let user = {
      username,
      password,
      // avatar,
      gender,
      bio,
      oauthinfo,
    }
    await UserModel.create(user)
    res.status(200).json({ code: 'OK', data: result })
  } catch (e) {
    res.status(200).json({ code: 'ERROR', data: e.message })
    return false
  }
})

module.exports = router
