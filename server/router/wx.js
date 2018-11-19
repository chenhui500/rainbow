const router = require("koa-router")()
const nwo = require('node-weixin-oauth')
const wxApi = require('../util/wx')
const db = require('../db/index')


//微信认证接口（授权）
//body   url 重定向的地址 （默认为 http://wx.yx101.cn）
//body userInfo: 0 表示最少的基本信息， 1表示获取更多用户信息(默认为 1 )
module.exports = router.post('/wxauto', async ctx => {
    let formData = ctx.request.body
    let url = formData.url || 'http://wx.yx101.cn'
    let userInfo = formData.userInfo == 0 ? 0 : 1
    let autourl = nwo.createURL(wxApi.appinfo.id, url, '', 1)
    ctx.body = autourl
    // ctx.redirect(autourl)
})

//通过code 获取用户信息
//query code 授权成功返回的code
module.exports = router.get('/userInfo', async ctx => {
    let result = {
        success: false,
        msg: '',
        data: null,
        code: -1
    }
    let query = ctx.query
    let code = query.code
    if (!code) {
        result.msg = "code丢失"
    } else {
        let autoInfo = await wxApi.getAutoInfo(code)
        if (autoInfo.errcode) {
            result.msg = "code无效"
        } else {
            console.log(autoInfo)
            let userInfo = await wxApi.getUserInfo(autoInfo.openid, autoInfo.access_token)
            if (userInfo.errcode) {
                result.msg = "获取认证信息失败"
            } else {
                result.success = true
                result.code = 0
                result.data = Object.assign({
                    userInfo,
                    autoInfo
                })
            }
        }

    }
    ctx.body = result
})


//通过code 获取autoinfo
//query code 授权成功返回的code
module.exports = router.get('/autoInfo', async ctx => {
    let result = {
        success: false,
        msg: '',
        data: null,
        code: -1
    }
    let query = ctx.query
    let code = query.code
    if (!code) {
        result.msg = "code丢失"
    } else {
        let autoInfo = await wxApi.getAutoInfo(code)
        if (autoInfo.errcode) {
            result.msg = "code无效"
        } else {
            result.success = true
            result.code = 0
            result.data = autoInfo
        }
    }
    ctx.body = result
})


//通过 openid ,accessToken ,refreshToken 找用户信息
//query openid 
//query rToken  返回的refreshToken 
//query token   返回的 accessToken
module.exports = router.get('/opUserinfo', async ctx => {
    let result = {
        success: false,
        msg: '',
        data: null,
        code: -1
    }
    let query = ctx.query
    let openid = query.openid
    let rToken = query.rToken
    let token = query.token
    let newToken = null
    let data = await wxApi.valToKen(openid, token)
    if (!data) {
        newToken = await wxApi.refreshToKen(rToken)
        token = newToken.access_token
    }
    let userInfo = await wxApi.getUserInfo(openid, token)
    if (userInfo.errcode) {
        result.msg = "获取认证信息失败"
    } else {
        result.success = true
        result.code = 0
        result.data = Object.assign({userInfo, newToken})
    }


    ctx.body = result
})

// 发送报价
// title:'维修价格',
// orderId:'123',
// content:'内容',
// openID:'oQBciw9rRatSaEb0CPiS3XliOgUM',
// order_id:'121212',
// remark      备注

module.exports = router.post('/:db/send/price', async ctx => {
    let result = {success: false, msg: '', data: null, code: -1}
    let params = ctx.request.body
    let dbName = ctx.params.db
    let obj = await db.findId(dbName, 'order', params.order_id)
    if (obj.length) {
        let sendTime = obj[0].sendTime
        if (!sendTime) {
            db.updata(dbName, 'order', params.order_id, {sendTime: new Date().getTime()})

        } else {
            let hour = 6
            let intervalTime = hour * 60 * 60 * 1000
            let nowDate = new Date().getTime()
            let t = nowDate - sendTime
            if (t < intervalTime) {
                let spareTime = Math.ceil((intervalTime - t) / (60 * 1000))
                result.msg = `${hour}小时内只能发送一次,还${spareTime}分钟，才能继续发送！`
                ctx.body = result
                return false
            } else {
                db.updata(dbName, 'order', params.order_id, {sendTime: new Date().getTime()})
            }
        }

    } else {
        result.msg = '订单不存在'
        ctx.body = result
        return false
    }


    let templateId = 'EPoBuDGSu3F_9pWK2-uTR455ugxyL-TCkBfYILuBSyQ'
    let url = `http://wx.yx101.cn/#/receive?order_id=${params.order_id}`
    let topcolor = '#FF0000'  // 顶部颜色
    let data = {
        first: {
            "value": params.title,
            "color": "#000000"
        },
        keyword1: {
            "value": params.orderId,
            "color": "#173177"
        },
        keyword2: {
            "value": params.content,
            "color": "#173177"
        },
        remark: {
            "value": params.remark,
            "color": "#173177"
        }
    }
    let resData = await wxApi.sendTemplate(params.openID, templateId, url, topcolor, data)
    if (resData.err) {
        result.msg = resData.err.message
    } else {
        result.success = true
        result.msg = '发送成功'
        result.code = 0
        result.data = resData.res
    }
    console.log(resData)

    ctx.body = result

})

//报修受理通知
// title:'你预约的微信报修服务已受理。',
// orderId:'123',
// time:报修时间
//state 报修状态
// openID:'oQBciw9rRatSaEb0CPiS3XliOgUM',
// order_id:'121212',
// remark      备注

module.exports = router.post('/:db/send/notice', async ctx => {
    let result = {success: false, msg: '', data: null, code: -1}
    let params = ctx.request.body
    let dbName = ctx.params.db
    let obj = await db.findId(dbName, 'order', params.order_id)
    if (!obj.length) {
        result.msg = '订单不存在'
        ctx.body = result
        return false
    }


    let templateId = '3h_qJKX-qwverFP91pACOo0MAsnGA-Dq9nch_o4O8y0'
    let url = `http://wx.yx101.cn/#/orderDetails?order_id=${params.order_id}`
    let topcolor = '#FF0000'  // 顶部颜色
    let data = {
        first: {
            "value": params.title,
            "color": "#000000"
        },
        keyword1: {
            "value": params.orderId,
            "color": "#173177"
        },
        keyword2: {
            "value": params.time,
            "color": "#173177"
        },
        keyword3: {
            "value": params.state,
            "color": "#173177"
        },
        remark: {
            "value": params.remark,
            "color": "#173177"
        }
    }
    let resData = await wxApi.sendTemplate(params.openID, templateId, url, topcolor, data)
    if (resData.err) {
        result.msg = resData.err.message
    } else {
        result.success = true
        result.msg = '发送成功'
        result.code = 0
        result.data = resData.res


    }
    console.log(resData)

    ctx.body = result

})

//报修成功通知
// title:'你预约的微信报修服务已受理。',
// orderId:'123',
// openID:'oQBciw9rRatSaEb0CPiS3XliOgUM',
// order_id:'121212',
// server     服务项目
// issue      问题分类
// remark      备注

module.exports = router.post('/:db/send/success', async ctx => {
    let result = {success: false, msg: '', data: null, code: -1}
    let params = ctx.request.body

    let dbName = ctx.params.db
    let obj = await db.findId(dbName, 'order', params.order_id)
    if (!obj.length) {
        result.msg = '订单不存在'
        ctx.body = result
        return false
    }
    console.log(params)
    let templateId = 'gzn6joS1bsn86pvrpN8rounSENCwY34uRFd-YiOnHus'
    let url = `http://wx.yx101.cn/#/orderDetails?order_id=${params.order_id}`
    let topcolor = '#FF0000'  // 顶部颜色
    let data = {
        first: {
            "value": params.title,
            "color": "#000000"
        },
        keyword1: {
            "value": params.server,
            "color": "#173177"
        },
        keyword2: {
            "value": params.issue,
            "color": "#173177"
        },
        remark: {
            "value": params.remark,
            "color": "#173177"
        }
    }
    let resData = await wxApi.sendTemplate(params.openID, templateId, url, topcolor, data)
    if (resData.err) {
        result.msg = resData.err.message
    } else {
        result.success = true
        result.msg = '发送成功'
        result.code = 0
        result.data = resData.res


    }
    console.log(resData)

    ctx.body = result

})


// 发送报价
// title:'维修价格',
// orderId:'123',
// content:'内容',
// openID:'oQBciw9rRatSaEb0CPiS3XliOgUM',
// order_id:'121212',
// remark      备注

/**
 * 发送派单通知
 */
module.exports = router.post('/:db/send/dispatch', async ctx => {
    let result = {success: false, msg: '', data: null, code: -1}
    let params = ctx.request.body
    console.log(params)

    let templateId = 'sf9I2cvZv8rQ3hDNAL5w-HCLyno5AkF62NmbxrZPedQ'
    let url = ``
    let topcolor = '#FF0000'  // 顶部颜色
    let data = {
        //标题
        first: {
            "value": params.title,
            "color": "#000000"
        },
        //服务单号
        keyword1: {
            "value": params.orderId,
            "color": "#173177"
        },
        //项目名称
        keyword2: {
            "value": params.projectName,
            "color": "#173177"
        },
        //请求用户
        keyword3: {
            "value": params.userInfo,
            "color": "#173177"
        },
        //请求内容
        keyword4: {
            "value": params.content,
            "color": "#173177"
        },
        //创建时间
        keyword5: {
            "value": params.time,
            "color": "#173177"
        },
        remark: {
            "value": params.remark,
            "color": "#173177"
        }
    }
    let resData = await wxApi.sendTemplate(params.openID, templateId, url, topcolor, data)
    if (resData.err) {
        result.msg = resData.err.message
    } else {
        result.success = true
        result.msg = '发送成功'
        result.code = 0
        result.data = resData.res
    }
    console.log(resData)

    ctx.body = result

})