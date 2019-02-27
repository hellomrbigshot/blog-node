const Page = require('../lib/page').Page

module.exports = {
    // 创建文章
    create(page) {
        return Page.create(page)
    },
    // 编辑文章
    update(id, updates) {
        let condition = { _id: id }
        return Page
            .update(condition, { $set: updates })
            .exec()
    },
    // 通过 id 获取文章
    getPageById(id) {
        return Page
            .findOne({ _id: id })
            .exec()
    },
    // 添加一条评论
    addPageComment(id, comment) {
        return Page
            .update({ _id: id }, { $push: { comments: comment } })
            .exec()
    },
    /**
     * @获取文章列表
     * @params {string} type='' - 根据类型获取 ['', 'creator', 'tag']
     * @params {string} content='' - 对应 type 的值
     * @params {sting} content='normal'
     * @params {number} pageSize
     * @params {number} Count
     * @params {boolean} secret
     */
    getPageList(query) {
        const type = query.type
        const content = query.content
        const status = query.status
        const pageSize = query.pageSize || 10
        const Count = query.Count || 0
        const secret = query.secret
        const sort = query.sort || 'create_date'
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
        return Page
            .find(query_obj)
            .skip(Count)
            .limit(pageSize)
            .sort({ sort: -1 })
            .exec()
    },
    /**
     * @查询文章数量
     * @params {string} type='' - 根据类型获取 ['', 'creator', 'tag']
     * @params {string} content='' - 对应 type 的值
     * @params {sting} content='normal'
     * @params {number} pageSize
     * @params {number} Count
     * @params {boolean} secret
     */
    getPageNum(query) {
        const type = query.type || ''
        const content = query.content || ''
        const status = query.status || ''
        const secret = query.secret
        let query_obj = {}
        if (status) {
            query_obj.status = status
        }
        if (type === 'create_user') {
            query_obj.create_user = content
        } else if (type === 'tag') {
            query_obj.tags = content
        }
        if (secret !== undefined) {
            query_obj.secret = JSON.parse(secret)
        }
        // console.log(query_obj)
        return Page
            .find(query_obj)
            .countDocuments()
            .exec()
    },
    searchPage(query) {
        const keywords = query.keywords || ''
        const pageSize = query.pageSize
        const Count = query.Count
        const reg = new RegExp(keywords, 'i')
        let query_obj = {
            secret: false,
            status: 'normal'
        }
        const sort = query.sort || 'create_date'
        if (keywords) {
            query_obj['$or'] = [ // 支持标题、正文和标签查找
                    { title: { $regex: reg, $options: '$i' }},
                    { content: { $regex: reg, $options: '$i' }},
                    { tags: { $regex: reg, $options: '$i' }}
                ]   
        }
        return Page
            .find(query_obj)
            .sort({ 'update_date': -1 })
            .skip(Count)
            .limit(pageSize)
            .exec()
    },
    searchPageNum(query) {
        const keywords = query.keywords
        const reg = new RegExp(keywords, 'i')
        let query_obj = {
            secret: false,
            status: 'normal'
        }
        if (keywords) {
            query_obj['$or'] = [ // 支持标题、正文和标签查找
                    { title: { $regex: reg, $options: '$i' }},
                    { content: { $regex: reg, $options: '$i' }},
                    { tags: { $regex: reg, $options: '$i' }}
                ]   
        }
        return Page
            .find(query_obj)
            .sort({ sort: -1 })
            .countDocuments()
            .exec()
    }
}