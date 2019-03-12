module.exports = {
	checkLogin (req, res, next) {
		if (!req.session.user) { // 登录超时 前端通过状态码 401 识别
      res.clearCookie('user') // 如果 session 中没有 user，清除客户端 cookie
			res.status(401).json({ code: 'error', data: '该用户未登录' })
			return false
		}
		next()
	},
	checkNotLogin (req, res, next) {
    if (!req.session.user) { // 如果 session 中没有 user，清除客户端 cookie
      res.clearCookie('user')
    }
		if (req.session.user) {
			res.status(402).json({ code: 'error', data: '该用户已登录' })
			return false
    }
		next()
  },
  clearCookie (req, res, next) {
    if (!req.session.user) { // 如果 session 中没有 user，清除客户端 cookie
      res.clearCookie('user')
    }
    next()
  }
}
