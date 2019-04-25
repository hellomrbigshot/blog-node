const Comment = require('../lib/comment').Comment

module.exports = {
  // 创建评论
  create(comment) {
    return Comment.create(comment)
  },
  // 通过 id 获取评论
  getCommentById(id) {
    return Comment
      .findOne({ _id: id })
      .exec()
  },
  // 查询评论列表
  getCommentList(query) {
    const type = query.type
    const content = query.content
    const pageSize = query.pageSize
    const Count = query.Count
    const username = query.username
    const is_read = query.is_read
    let query_obj = {}
    if (type === 'page') {
      query_obj.page_id = content
    } else if (type === 'create_user') {
      query_obj.create_user = content
    } else if (type === 'to_user') {
      // 我文章回复 + 我评论的回复
      // 剔除我对自己评论的回复
      query_obj.$or = [
        { to_user: content },
        { reply_user: content }
      ]
      query_obj.create_user = { $ne: username }
    }
    if (is_read === false) {
      query_obj.is_read = false
    }
    if (pageSize !== undefined && Count !== undefined) {
      return Comment
        .find(query_obj)
        .sort({ 'create_time': -1 })
        .skip(Count)
        .limit(pageSize)
        .exec()
    } else {
      return Comment
        .find(query_obj)
        .sort({ 'create_time': -1 })
        .exec()
    }

  },
  // 查询评论数量
  getCommentNum(type, content, username, is_read) {
    let query_obj = {}
    if (type === 'page') {
      query_obj.page_id = content
    } else if (type === 'create_user') {
      query_obj.create_user = content
    } else if (type === 'to_user') {
      // 我文章回复 + 我评论的回复
      // 剔除我对自己评论的回复
      query_obj.$or = [
        { to_user: content },
        { reply_user: content }
      ]
      query_obj.create_user = { $ne: username }
    }
    if (is_read === false) {
      query_obj.is_read = false
    }
    return Comment
      .find(query_obj)
      .countDocuments()
      .exec()
  },
  // 批量更新状态
  updateCommentsStatus(ids) {
    return Comment
      .updateMany({ _id: {$in: ids} }, { $set: { is_read: true }})
      .exec()
  }
}