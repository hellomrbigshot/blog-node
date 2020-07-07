const User = require('../lib/user').User

module.exports = {
  // 注册一个用户
  create (user) {
    return User.create(user)
  },
  // 通过用户名获取用户信息
  getUserByName (username) {
    return User.findOne({ username: username }).exec()
  },
  // 通过第三方登录信息获取用户信息
  getUserByOauthInfo ({ type, name }) {
    return User.findOne({
      oauthinfo: { $elemMatch: { type: type, name: name } }
    }).exec()
  },
  // 添加一条第三方授权信息
  insertUserOauth ({ username, type, avatar_url, name }) {
    return User.updateOne(
      { username: username },
      {
        $push: {
          oauthinfo: {
            type,
            avatar_url,
            name
          }
        }
      }
    ).exec()
  },
  // 获取所有用户列表
  getUserList (pageSize, Count) {
    return User.find()
      .skip(Count)
      .limit(pageSize)
      .exec()
  },
  // 获取用户数量
  getUserNum () {
    return User.find()
      .countDocuments()
      .exec()
  },
  // 编辑头像
  updateAvatar ({ username, avatar }) {
    return User.updateOne(
      { username },
      { avatar }
    ).exec()
  },
  // 编辑个人简介
  updateBio({ username, bio }) {
    return User.updateOne(
      { username },
      { bio }
    ).exec()
  }
}
