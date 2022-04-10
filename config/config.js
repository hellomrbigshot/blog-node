const DEBUG_MODE = false
const HOST = DEBUG_MODE
  ? 'http://127.0.0.1:7000'
  : 'https://hellomrbigbigshot.xyz'
const SECRET_KEY = 'blog-node'
const JWT_EXPIRES = '8h' // token 过期时间为 8 小时
const REFRESH_JWT_EXPIRES = '7 days' // refresh token 过期时间为一周
module.exports = {
  DEBUG_MODE,
  HOST,
  SECRET_KEY,
  JWT_EXPIRES,
  REFRESH_JWT_EXPIRES
}
