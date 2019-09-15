/**
 * 写一个闭包来缓存用户名
 */
const cacheUser = (() => {
  let username = ''
  return {
    setUserName: (user) => {
      if (username === user) {
        return false
      }
      username = user
    },
    getUserName: () => {
      return  username
    },
    clearUserName: () => {
      username = ''
    }
  }
})()

module.exports = {
  cacheUser
}
