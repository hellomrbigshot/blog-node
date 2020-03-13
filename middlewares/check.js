const { validateToken } = require('../utils/jwt')

module.exports = {
	checkLogin (req, res, next) {
    const { headers: { authorization } } = req
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
	},
	checkNotLogin (req, res, next) {
    if (!req.session.user) { // 如果 session 中没有 user，清除客户端 cooki
    }
		if (req.session.user) {
			// res.status(402).json({ code: 'ERROR', data: '该用户已登录' })
			return false
    }
		next()
  },
  clearCookie (req, res, next) {
    // if (!req.session.user) { // 如果 session 中没有 user，清除客户端 cookie
    //   if (global.user) delete global.user
    //   res.clearCookie('user')
    // }
    next()
  }
}
