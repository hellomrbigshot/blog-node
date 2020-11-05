const Page = require('../lib/page').Page

module.exports = {
  // 创建文章
  create (page) {
    return Page.create(page)
  },
  // 编辑文章
  update (id, updates) {
    let condition = { _id: id }
    return Page.update(condition, { $set: updates }).exec()
  },
  // 通过 id 获取文章
  getPageById (id) {
    console.log(id)
    return Page.findOne({ _id: id }).exec()
  },
  // 添加一条评论
  addPageComment (id, comment) {
    return Page.updateOne({ _id: id }, { $push: { comments: comment } }).exec()
  },
  /**
   * @description 获取文章列表
   * @param {string} type='' - 根据类型获取 ['', 'creator', 'tag']
   * @param {string} content='' - 对应 type 的值
   * @param {sting} content='normal'
   * @param {number} pageSize
   * @param {number} Count
   * @param {boolean} secret
   */
  getPageList ({ type, content, status, pageSize = 10, Count = 0, secret, sort = 'create_time' }) {
    let query_obj = {}
    if (status) {
      query_obj.status = status
    }
    if (type === 'create_user') {
      query_obj.create_user = content
    }
    if (secret !== undefined) {
      query_obj.secret = JSON.parse(secret)
    }
    if (type === 'tag') {
      query_obj.tags = content
    }
    return Page.find(query_obj)
      .skip(Count)
      .limit(pageSize)
      .sort({ [sort]: -1 })
      .exec()
  },
  /**
   * @description 查询文章数量
   * @param {string} type='' - 根据类型获取 ['', 'creator', 'tag']
   * @param {string} content='' - 对应 type 的值
   * @param {sting} content='normal'
   * @param {number} pageSize
   * @param {number} Count
   * @param {boolean} secret
   */
  getPageNum ({ type, content, status, secret }) {
    let query_obj = {}
    if (status) {
      query_obj.status = status
    }
    if (type === 'create_user') {
      query_obj.create_user = content
    } else if (type === 'tag') {
      query_obj.tags = content
    }
    if (secret) {
      query_obj.secret = JSON.parse(secret)
    }
    return Page.find(query_obj).countDocuments().exec()
  },
  searchPage ({ keywords, pageSize, Count }) {
    const reg = new RegExp(keywords, 'i')
    let query_obj = {
      secret: false,
      status: 'normal',
    }
    if (keywords) {
      query_obj['$or'] = [
        // 支持标题、正文和标签查找
        { title: { $regex: reg } },
        { content: { $regex: reg } },
        { tags: { $regex: reg } },
      ]
    }
    return Page.find(query_obj)
      .sort({ update_time: -1 })
      .skip(Count)
      .limit(pageSize)
      .exec()
  },
  searchPageNum ({ keywords }) {
    const reg = new RegExp(keywords, 'i')
    let query_obj = {
      secret: false,
      status: 'normal',
    }
    if (keywords) {
      query_obj['$or'] = [
        // 支持标题、正文和标签查找
        { title: { $regex: reg } },
        { content: { $regex: reg } },
        { tags: { $regex: reg } },
      ]
    }
    return Page.find(query_obj).sort({ sort: -1 }).countDocuments().exec()
  },
}
