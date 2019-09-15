const jwt = require('jsonwebtoken')
const { SECRET_KEY, JWT_EXPIRES, REFRESH_JWT_EXPIRES } = require('../config/config')
const { cacheUser } = require('../cache/user')

/**
 * 生成 token 和 initToken
 * @param {string} username 
 */
function initToken (username) {
  return {
    token: jwt.sign({
      username: username
    }, SECRET_KEY, {
      expiresIn: JWT_EXPIRES
    }),
    refresh_token: jwt.sign({
      username
    }, SECRET_KEY, {
      expiresIn: REFRESH_JWT_EXPIRES
    })
  }
}
/**
 * 从 token 中提取用户
 * @param {string} token 格式为 `Beare ${token}`
 */
function getTokenUser (token) {
  try {
    token = token.replace(/^Beare /, '')
    const decoded = jwt.verify(token, SECRET_KEY)
    return decoded.username
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 * 验证 token/refreshToken
 * @param {string} token 格式为 `Beare ${token}`
 */
function validateToken (token, type) {
  try {
    token = token.replace(/^Beare /, '')
    const { username } = jwt.verify(token, SECRET_KEY)
    if (type !== 'refreshToken') {
      // 如果是 token 且 token 生效，缓存 token
      cacheUser.setUserName(username)
    }
  } catch (e) {
    throw new Error(e.message)
  }
}

module.exports = {
  initToken,
  getTokenUser,
  validateToken
}
