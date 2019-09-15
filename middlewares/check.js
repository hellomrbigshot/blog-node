const { getTokenUser, validateToken } = require('../utils/jwt')

module.exports = {
	checkLogin (req, res, next) {
    // const headers = JSON.parse(JSON.stringify(req.headers))
    // const { authorization } = headers
    const { headers: { authorization } } = req
    if (!authorization) {
      // res.clearCookie('token') // 如果 session 中没有 user，清除客户端 cookie
      res.status(402).json({ code: 'ERROR', data: '未检测到登录信息' })
      return false
    }
    try {
      validateToken(authorization)
    } catch (e) {
      if (e.message === 'jwt expired') {
        // token 超时
        // res.clearCookie('token') // 如果 session 中没有 user，清除客户端 cookie
        res.status(401).json({ code: 'ERROR', data: '登录超时' })
        return false
      } else {
        res.status(402).json({ code: 'ERROR', data: '未检测到登录信息' })
        return false
      }
    }
    
    // if (!req.session.user) { // 登录超时 前端通过状态码 401 识别
      // console.log(req.header.Authorization)
      // if (global.user) delete global.user
      // res.clearCookie('token') // 如果 session 中没有 user，清除客户端 cookie
			// res.status(401).json({ code: 'ERROR', data: '该用户未登录' })
			// return false
		// }
		next()
	},
	checkNotLogin (req, res, next) {
    if (!req.session.user) { // 如果 session 中没有 user，清除客户端 cookie
      // if (global.user) delete global.user
      // res.clearCookie('user')
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
