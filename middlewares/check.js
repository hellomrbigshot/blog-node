const { validateToken } = require('../utils/jwt')

module.exports = {
  checkLogin(req, res, next) {
    const {
      headers: { authorization }
    } = req
    if (!authorization) {
      res.status(402).json({ code: 'ERROR', data: '未检测到登录信息' })
      return false
    }
    try {
      validateToken(authorization)
    } catch (e) {
      if (e.message === 'jwt expired') {
        // token 超时
        res.status(401).json({ code: 'ERROR', data: '登录超时' })
        return false
      } else {
        res.status(402).json({ code: 'ERROR', data: '未检测到登录信息' })
        return false
      }
    }
    next()
  }
}
