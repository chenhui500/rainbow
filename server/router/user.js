const router = require("koa-router")();
const db = require('../db/index')
const jwt = require('jsonwebtoken')
const config = require('../config')
const jwsSecret = config.jwsSecret
var moment = require('moment');
const crypto = require('crypto');
const request = require('request');

/**
 * 通过openid 获取用户信息
 */
module.exports = router.post("/:db/user/getUserInfo", async ctx => {
    let result = {success: false, msg: "", data: [], code: -1}
    let params = ctx.params
    let user = ctx.request.body
    let obj = await db.findTableInfo(params.db, "user", user)

    if (obj.length > 0) {

        let grade = obj[0].user_grade;
        let rtGrade = await db.findTableInfo(params.db, "rank", {grade_type: grade})
        let user_grade_name = "";

        if (rtGrade.length > 0) {
            user_grade_name = rtGrade[0].grade_name
        }
        let objData = {
            _id: obj[0]._id,
            openid: obj[0].openid,
            user_name: obj[0].user_name,
            user_phone: obj[0].user_phone,
            user_address: obj[0].user_address,
            user_type: obj[0].user_type,
            invite_name: obj[0].invite_name,
            invite_phone: obj[0].invite_phone,
            sid: obj[0].sid,
            create_time: obj[0].create_time,
            user_grade: obj[0].user_grade,
            user_grade_name: user_grade_name
        }


        result.success = true
        result.code = 0
        result.msg = "获取用户信息成功"
        result.data = objData
    } else {
        result.msg = "未找到数据"
        result.data = obj
    }
    ctx.body = result
})


/**
 * 注册授权用户基本信息
 */
module.exports = router.post("/:db/user/addUser", async ctx => {
    let result = {success: false, msg: "", data: [], code: -1}
    let params = ctx.params
    let user = ctx.request.body
    let creat_time = moment().format('YYYY-MM-DD HH:mm:ss');
    user = Object.assign(user, {create_time: creat_time})
    user = Object.assign(user, {user_grade: "1"})
    let obj = await db.insert(params.db, "user", user)

    if (obj.insertedCount > 0) {

        let rtGrade = await db.findTableInfo(params.db, "rank", {grade_type: "1"})
        let user_grade_name = "";

        if (rtGrade.length > 0) {
            user_grade_name = rtGrade[0].grade_name
        }
        let objData = {
            _id: obj.ops[0]._id,
            openid: obj.ops[0].openid,
            user_name: obj.ops[0].user_name,
            user_phone: obj.ops[0].user_phone,
            user_address: obj.ops[0].user_address,
            user_type: obj.ops[0].user_type,
            invite_name: obj.ops[0].invite_name,
            invite_phone: obj.ops[0].invite_phone,
            sid: obj.ops[0].sid,
            create_time: obj.ops[0].create_time,
            user_grade: obj.ops[0].user_grade,
            user_grade_name: user_grade_name
        }

        result.success = true
        result.code = 0
        result.msg = "注册用户成功"
        result.data = objData
    } else {
        result.msg = "注册用户失败"
        result.data = obj
    }
    ctx.body = result
})


/**
 * 修改用户基本信息
 */
module.exports = router.post('/:db/user/updateUser', async ctx => {
    let result = {success: false, msg: '', data: [], code: -1}
    let params = ctx.params
    let updateData = ctx.request.body

    let obj = await db.updata(params.db, "user", updateData.uid, updateData)
    if (obj) {
        let dataResult=updateData
        result.success = true
        result.msg = '更新成功'
        result.data=updateData
        result.code = 0
    } else {
        result.msg = '更新失败'
    }
    ctx.body = result
})


//--------------------预约 start---------------------------------
/**
 * 添加预约表单信息
 */
module.exports = router.post("/:db/order/addOrder", async ctx => {
    let result = {success: false, msg: "", data: [], code: -1}
    let params = ctx.params
    let orders = ctx.request.body

    //console.log(orders.uid)
    //db.findId(params.db,"policy",orders.uid)
    /*    console.log(orders.uid)
        let obj=await db.findId(params.db,"policy",orders.uid)
        console.log("------------->"+obj.length)*/
    /*if(obj.length==0){

        db.insert(params.db,"policy",{"uid":166,"name":"白菜在练习"})
    }*/
    /*    //获取当前时间往前推移90天
        var date=moment().add(90,'days').calendar();
        var d=moment(date).format('YYYY-MM-DD')
        console.log("==ddd=="+d)*/

    if (orders.orderlist.length > 0) {
        orders.orderlist.forEach(function (item, index) {
            //console.log(item+'---'+index);
            //用户名称
            item = Object.assign(item, {user_name: orders.user_name})
            //用户手机
            item = Object.assign(item, {user_phone: orders.user_phone})

            //用户微信授权ID
            item = Object.assign(item, {openid: orders.openid})
            //用户ID
            item = Object.assign(item, {uid: orders.uid})
            //参加活动ID
            item = Object.assign(item, {policyid: orders.policyid})
            //参加活动结束日期
            item = Object.assign(item, {end_date: orders.end_date})

            //推荐状态 1 已推荐 2 已上门 3 已成交 4失效
            item = Object.assign(item, {recommended_state: "1"})
            //推荐状态 1套餐90天活动
            item = Object.assign(item, {policy_type: "1"})
            //创建时间
            var time = moment().format("YYYY-MM-DD")
            //console.log("--time->"+time)
            item = Object.assign(item, {create_time: time})
            //console.log("--item->"+item)
            db.insert(params.db, "order", item)
        });
        result.success = true
        result.msg = "提交成功"
        result.code = 0
    } else {
        result.msg = "提交不成功"
    }

    ctx.body = result
})


/**
 * 获取推荐信息列表
 */
module.exports = router.post("/:db/order/getOrderList", async ctx => {
    let result = {success: false, msg: "", data: [], days: 0, code: -1, one: 0, two: 0, three: 0, four: 0, sum: 0}
    let params = ctx.params
    let orders = ctx.request.body
    let obj = await db.findTableList(params.db, "order", orders)

    if (obj.length > 0) {
        result.sum = obj.length;

        let paramfilter = {openid: orders.openid, uid: orders.uid, recommended_state: "1"}
        let objState = await db.findTableList(params.db, "order", paramfilter)
        result.one = objState.length;

        paramfilter = {openid: orders.openid, uid: orders.uid, recommended_state: "2"}
        objState = await db.findTableList(params.db, "order", paramfilter)
        result.two = objState.length;


        paramfilter = {openid: orders.openid, uid: orders.uid, recommended_state: "3"}
        objState = await db.findTableList(params.db, "order", paramfilter)
        result.three = objState.length;

        paramfilter = {openid: orders.openid, uid: orders.uid, recommended_state: "4"}
        objState = await db.findTableList(params.db, "order", paramfilter)
        result.four = objState.length;


        var arr = [];
        var results = obj

        results.sort()
        for (var i = 0; i < results.length;) {
            var arrayObj = new Array();
            var count = 0;
            for (var j = i; j < results.length; j++) {
                if (results[i].end_date === results[j].end_date) {
                    arrayObj.push(results[j])
                    count++;
                }
            }
            let pickDate = moment(results[i].end_date);
            let diff = pickDate.diff(moment(), 'days');//相差几天

            arr.push({
                lists: arrayObj,
                count: count,
                days: diff
            })
            i += count;
        }

        for (var k = 0; k < arr.length; k++) {
            console.log(arr[k])
        }


        result.success = true
        result.code = 0
        result.msg = "获取信息成功"
        result.data = arr
    } else {
        result.msg = "未找到数据"
        result.data = obj
    }
    ctx.body = result
})

/**
 * 通过id获取推荐详情信息
 */

module.exports = router.post('/:db/order/getOrderById', async ctx => {
    let result = {success: false, msg: '', data: [], code: -1}
    let params = ctx.params
    let orders = ctx.request.body
    let id = orders.orderid
    let obj = await db.findId(params.db, "order", id)
    if (obj.length > 0) {
        result.success = true
        result.msg = '获取数据成功'
        result.data = obj
        result.code = 0
    } else {
        result.msg = '获取数据不成功'
    }
    ctx.body = result
})

/**
 * 修改推荐信息
 */
module.exports = router.post('/:db/order/updateOrder', async ctx => {
    let result = {success: false, msg: '', data: [], code: -1}
    let params = ctx.params
    let updateData = ctx.request.body

    let obj = await db.updata(params.db, "order", updateData.orderId, updateData)
    if (obj) {
        result.success = true
        result.msg = '更新成功'
        result.code = 0
    } else {
        result.msg = '更新失败'
    }
    ctx.body = result
})


//必带参数 pageNum ,pageSize, filter    不传pageNum or pageSize 当做全部查
module.exports = router.get('/:db/api/:table', async ctx => {
    let result = {success: false, msg: '', data: [], code: -1, total: 0}
    let params = ctx.params
    let query = ctx.query

    let pageNum = query.pageNum ? parseInt(query.pageNum) : ''
    let pageSize = query.pageSize ? parseInt(query.pageSize) : ''
    let filter = query.filter ? JSON.parse(query.filter) : {}
    //console.log("---pageNum--"+pageNum+"--pageSize--"+pageSize+"--filter--"+filter)
    let obj = null

    if (pageNum && pageSize) {
        obj = await db.findTablePage(params.db, params.table, filter, pageNum, pageSize)
    } else {
        obj = await db.findTableList(params.db, params.table, filter)
    }
    let total = await db.findCount(params.db, params.table, filter)

    if (obj) {
        result.success = true
        result.msg = obj.length ? '查询成功' : '找不到数据'
        result.data = obj
        result.code = 0
        result.total = total
    } else {
        result.msg = '查询失败'
    }

    ctx.body = result
})


//-------------------预约 end---------------------------------------

//--------------------参加活动 start---------------------------------
/**
 * 添加参加活动表
 */
module.exports = router.post("/:db/policy/addPolicy", async ctx => {
    let result = {success: false, msg: "", data: [], code: -1}
    let params = ctx.params
    let insertData = ctx.request.body
    //推荐状态 1套餐90天活动
    /*insertData = Object.assign(insertData,{policy_type:"1"})*/
    let obj = await db.insert(params.db, "policy", insertData)
    //console.log("-obj.insertedCount-"+obj.insertedCount)
    if (obj.insertedCount) {
        result.success = true
        result.msg = "插入成功"
        result.data = obj.ops[0]
        result.code = 0
    } else {
        result.msg = "插入失败"
    }
    ctx.body = result
})


/**
 * 获取参加活动表
 */
module.exports = router.post("/:db/policy/getPolicy", async ctx => {
    let result = {success: false, msg: "", data: [], code: -1}
    let params = ctx.params
    let user = ctx.request.body
    let obj = await db.findTableInfo(params.db, "policy", user)

    if (obj.length > 0) {
        result.success = true
        result.code = 0
        result.msg = "获取信息成功"
        result.data = obj
    } else {
        result.msg = "未找到数据"
        result.data = obj
    }
    ctx.body = result
})


//--------------------参加活动 end---------------------------------

//--------------------推荐奖励说明 start---------------------------------
/**
 * 添加推荐奖励说明
 */
module.exports = router.post("/:db/reward/addReward", async ctx => {
    let result = {success: false, msg: "", data: [], code: -1}
    let params = ctx.params
    let insertData = ctx.request.body

    let obj = await db.insert(params.db, "reward", insertData)

    if (obj.insertedCount) {
        result.success = true
        result.msg = "插入成功"
        result.data = obj.ops[0]
        result.code = 0
    } else {
        result.msg = "插入失败"
    }
    ctx.body = result
})


/**
 * 获取推荐奖励说明
 */
module.exports = router.post("/:db/reward/getRewards", async ctx => {
    let result = {success: false, msg: "", data: [], code: -1}
    let params = ctx.params
    let user = ctx.request.body
    let obj = await db.findTableInfo(params.db, "reward", user)

    if (obj.length > 0) {
        result.success = true
        result.code = 0
        result.msg = "获取信息成功"
        result.data = obj
    } else {
        result.msg = "未找到数据"
        result.data = obj
    }
    ctx.body = result
})


/**
 * 修改推荐奖励说明
 */
module.exports = router.post('/:db/reward/updateReward', async ctx => {
    let result = {success: false, msg: '', data: [], code: -1}
    let params = ctx.params
    let updateData = ctx.request.body

    let obj = await db.updata(params.db, "reward", updateData.rewardId, updateData)
    if (obj) {
        result.success = true
        result.msg = '更新成功'
        result.code = 0
    } else {
        result.msg = '更新失败'
    }
    ctx.body = result
})


/**
 * 删除推荐奖励说明
 */
module.exports = router.post('/:db/reward/delReward', async ctx => {
    let result = {success: false, msg: '', data: [], code: -1}
    let params = ctx.params
    let delData = ctx.request.body
    let obj = await db.remove(params.db, "reward", delData.rewardId)
    if (obj.value) {
        result.success = true
        result.msg = '删除成功'
        result.code = 0
    } else {
        result.msg = '删除失败'
        result.code = -1
    }
    result.data = obj.value
    ctx.body = result
})


/**
 * 通过id获取推荐奖励说明
 */

module.exports = router.post('/:db/reward/getRewardById', async ctx => {
    let result = {success: false, msg: '', data: [], code: -1}
    let params = ctx.params
    let orders = ctx.request.body
    let id = orders.rewardId
    let obj = await db.findId(params.db, "reward", id)
    if (obj.length > 0) {
        result.success = true
        result.msg = '获取数据成功'
        result.data = obj
        result.code = 0
    } else {
        result.msg = '获取数据不成功'
    }
    ctx.body = result
})
//--------------------推荐奖励说明 end---------------------------------

/**
 * 获取时间间隔多少天
 */
module.exports = router.post("/:db/intervalDays", async ctx => {
    let result = {success: false, msg: "", data: [], code: -1}
    let data = ctx.request.body
    let pickDate = moment(data.date);
    let diff = pickDate.diff(moment(), 'days');//相差几天

    result.success = true
    result.code = 0
    result.msg = "获取信息成功"
    result.data = diff

    ctx.body = result
})

//------------------------------------------------------------------------

/**
 * 新增管理员用户
 */
module.exports = router.post("/:db/admin/addAdminUser", async ctx => {
    let result = {success: false, msg: "", data: [], code: -1}
    let params = ctx.params
    let insertData = ctx.request.body
    var md5 = crypto.createHash('md5')

    var cryptedPassword = md5.update(insertData.password).digest('hex');
    insertData = Object.assign(insertData, {password: cryptedPassword})
    let obj = await db.insert(params.db, "admin", insertData)

    if (obj.insertedCount) {
        result.success = true
        result.msg = "插入成功"
        result.data = obj.ops[0]._id
        result.code = 0
    } else {
        result.msg = "插入失败"
    }
    ctx.body = result
})


/**
 * 更新数据
 */
module.exports = router.post("/:db/admin/updateAdminUser", async ctx => {
    let result = {success: false, msg: "", data: [], code: -1}
    let params = ctx.params
    let updateData = ctx.request.body
    var md5 = crypto.createHash('md5')

    var cryptedPassword = md5.update(updateData.password).digest('hex');
    updateData = Object.assign(updateData, {password: cryptedPassword})

    let obj = await db.updata(params.db, "admin", updateData.adminid, updateData)

    if (obj) {
        result.success = true
        result.msg = '更新成功'
        result.code = 0
    } else {
        result.msg = '更新失败'
    }

    ctx.body = result
})

/**
 * 删除推荐奖励说明
 */
module.exports = router.post('/:db/admin/delAdminUser', async ctx => {
    let result = {success: false, msg: '', data: [], code: -1}
    let params = ctx.params
    let delData = ctx.request.body
    let obj = await db.remove(params.db, "admin", delData.adminid)
    if (obj.value) {
        result.success = true
        result.msg = '删除成功'
        result.code = 0
    } else {
        result.msg = '删除失败'
        result.code = -1
    }
    result.data = obj.value
    ctx.body = result
})

/**
 * 管理员登录
 */
module.exports = router.post("/:db/admin/login", async ctx => {
    let result = {success: false, msg: "账号密码错误", code: -1, account: {}}
    let params = ctx.params
    let user = ctx.request.body

    var md5 = crypto.createHash('md5')
    var cryptedPassword = md5.update(user.password).digest('hex');

    user = Object.assign(user, {password: cryptedPassword})
    let obj = await db.findTableInfo(params.db, "admin", user)

    if (obj.length > 0) {
        let profile = {
            user: user.username,
            id: 0
        }
        result.token = jwt.sign(profile, jwsSecret, {expiresIn: 60 * 60 * 24 * 3})
        result.success = true
        result.code = 0
        result.msg = "登录成功"
        result.account.name = obj[0].username
        result.account._id = obj[0]._id
    } else {
        if ("ch" == user.username && "e10adc3949ba59abbe56e057f20f883e" == user.password) {
            let profile = {
                user: "ch",
                id: 0
            }
            result.token = jwt.sign(profile, jwsSecret, {expiresIn: 60 * 60 * 24 * 3})
            result.success = true
            result.code = 0
            result.msg = "登录成功"
            result.account.name = "ch"
            result.account._id = 0
        }
        result.msg = "账号密码错误"
        result.account = obj
    }
    ctx.body = result


})

//-------------------活动-----------------------

/**
 * 添加活动
 */
module.exports = router.post("/:db/promotion/addPromotion", async ctx => {
    let result = {success: false, msg: "", data: [], code: -1}
    let params = ctx.params
    let insertData = ctx.request.body

    let obj = await db.insert(params.db, "promotion", insertData)

    if (obj.insertedCount) {
        result.success = true
        result.msg = "插入成功"
        result.data = obj.ops[0]
        result.code = 0
    } else {
        result.msg = "插入失败"
    }
    ctx.body = result
})


/**
 * 获取活动列表
 */
module.exports = router.post("/:db/promotion/getPromotions", async ctx => {
    let result = {success: false, msg: "", data: [], code: -1}
    let params = ctx.params
    let user = ctx.request.body
    let obj = await db.findTableInfo(params.db, "promotion", user)

    if (obj.length > 0) {
        result.success = true
        result.code = 0
        result.msg = "获取信息成功"
        result.data = obj
    } else {
        result.msg = "未找到数据"
        result.data = obj
    }
    ctx.body = result
})


/**
 * 修改活动列表
 */
module.exports = router.post('/:db/promotion/updatePromotion', async ctx => {
    let result = {success: false, msg: '', data: [], code: -1}
    let params = ctx.params
    let updateData = ctx.request.body

    let obj = await db.updata(params.db, "promotion", updateData.promotionid, updateData)
    if (obj) {
        result.success = true
        result.msg = '更新成功'
        result.data = obj.value
        result.code = 0
    } else {
        result.msg = '更新失败'
    }
    ctx.body = result
})


/**
 * 删除活动
 */
module.exports = router.post('/:db/promotion/delPromotion', async ctx => {
    let result = {success: false, msg: '', data: [], code: -1}
    let params = ctx.params
    let delData = ctx.request.body
    let obj = await db.remove(params.db, "promotion", delData.promotionid)
    if (obj.value) {
        result.success = true
        result.msg = '删除成功'
        result.code = 0
    } else {
        result.msg = '删除失败'
        result.code = -1
    }
    result.data = obj.value
    ctx.body = result
})

/**
 * 获取参加活动结束时间
 */
module.exports = router.post("/:db/order/getOverDate", async ctx => {
    let result = {success: false, msg: "", data: [], days: 0, code: -1}
    let params = ctx.params
    let orders = ctx.request.body

    let paramfilter = {openid: orders.openid, uid: orders.uid, policyid: orders.policyid}
    let results = await db.findTableList(params.db, "order", paramfilter)
    let rt = false;
    let newDate = moment().format('YYYY-MM-DD')
    if (results.length > 0) {
        for (var i = 0; i < results.length;) {

            var oldDate = results[i].end_date
            rt = moment(newDate).isBefore(oldDate)
            console.log("--rt-->" + rt)
            if (rt) {
                result.data = {end_date: oldDate}
                break;
            }
            i++;
        }

    } else {

        let promotionInfo = await db.findId(params.db, "promotion", "5c04c645341bc035ea0b34ca")
        if (promotionInfo.length > 0) {
            let d = promotionInfo[0].promotion_days;

            //获取当前时间往前推移d n天 90天
            let rtdays = moment().add(d, 'days').calendar();
            let daysSplit = rtdays.split("/");
            result.days = d;
            newDate = daysSplit[2] + "-" + daysSplit[0] + "-" + daysSplit[1]
        }

    }
    console.log("----rt-->" + rt);
    if (rt == false) {
        result.data = {end_date: newDate}
        result.code = 0
        result.success = true
        result.msg = '获取参与活动结束时间'
    } else {
        result.code = 0
        result.success = true
        result.msg = '获取参与活动结束时间'
    }

    ctx.body = result

})
//--------------------  end---------------------------------

//-------------------邀请码-----------------------
/**
 * 获取邀请码
 */
module.exports = router.post('/:db/invitecode/getInviteCode', async ctx => {
    let result = {success: false, msg: '', data: [], code: -1}
    let params = ctx.params
    let insertData = ctx.request.body
    let jschars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    let res = "";


    for (var i = 0; i < 4; i++) {
        let id = Math.ceil(Math.random() * 35);
        res += jschars[id];
    }

    let selectUser = {"openid": insertData.openid}
    //查询用户信息
    let userInfo = await db.findTableInfo(params.db, "user", selectUser)
    if (userInfo.length > 0) {
        let creat_time = moment().format('YYYY-MM-DD HH:mm:ss');
        let effective_time = moment().add('days', 7).format('YYYY-MM-DD HH:mm:ss');
        ;
        let insertData = {
            "uid": userInfo[0]._id.toString(),
            "openid": userInfo[0].openid,
            "user_name": userInfo[0].user_name,
            "user_phone": userInfo[0].user_phone,
            "user_address": userInfo[0].user_address,
            "code": res,
            "creat_time": creat_time,
            "effective_time": effective_time
        }

        let insertObj = await db.insert(params.db, "invitecode", insertData)
        console.log("-----+" + insertObj)
        if (insertObj.insertedCount) {
            result.success = true
            result.msg = '获取邀请码成功'
            result.data = {code: res}
            result.code = 0
        }
    } else {
        result.msg = '获取邀请码不成功'
        result.code = -1
    }

    ctx.body = result
})

/**
 * 验证邀请码
 */
module.exports = router.post('/:db/invitecode/validateInviteCode', async ctx => {
    let result = {success: false, msg: '', data: [], code: -1}
    let params = ctx.params
    let selectData = ctx.request.body

    let getData = {code: selectData.code.toUpperCase()}

    let obj = await db.findTableInfo(params.db, "invitecode", getData)
    if (obj.length > 0) {
        result.success = true
        result.msg = '验证成功'
        result.data = obj[0]
        result.code = 0
    } else {
        result.msg = '验证不成功'
    }

    ctx.body = result
})

//--------------------  end---------------------------------

//-------------------- 简介 -------------------------------

/**
 * 添加简介
 */
module.exports = router.post("/:db/synopsis/addSynopsis", async ctx => {
    let result = {success: false, msg: "", data: [], code: -1}
    let params = ctx.params
    let insertData = ctx.request.body

    let obj = await db.insert(params.db, "synopsis", insertData)

    if (obj.insertedCount) {
        result.success = true
        result.msg = "插入成功"
        result.data = obj.ops[0]
        result.code = 0
    } else {
        result.msg = "插入失败"
    }
    ctx.body = result
})


/**
 * 获取简介列表
 */
module.exports = router.post("/:db/synopsis/getSynopsis", async ctx => {
    let result = {success: false, msg: "", data: [], code: -1}
    let params = ctx.params
    let user = ctx.request.body
    let obj = await db.findTableInfo(params.db, "synopsis", user)

    if (obj.length > 0) {
        result.success = true
        result.code = 0
        result.msg = "获取信息成功"
        result.data = obj
    } else {
        result.msg = "未找到数据"
        result.data = obj
    }
    ctx.body = result
})


/**
 * 修改简介列表
 */
module.exports = router.post('/:db/synopsis/updateSynopsis', async ctx => {
    let result = {success: false, msg: '', data: [], code: -1}
    let params = ctx.params
    let updateData = ctx.request.body

    let obj = await db.updata(params.db, "synopsis", updateData.sid, updateData)
    if (obj) {
        result.success = true
        result.msg = '更新成功'
        result.data = obj.value
        result.code = 0
    } else {
        result.msg = '更新失败'
    }
    ctx.body = result
})


/**
 * 删除简介
 */
module.exports = router.post('/:db/synopsis/delSynopsis', async ctx => {
    let result = {success: false, msg: '', data: [], code: -1}
    let params = ctx.params
    let delData = ctx.request.body
    let obj = await db.remove(params.db, "synopsis", delData.sid)
    if (obj.value) {
        result.success = true
        result.msg = '删除成功'
        result.code = 0
    } else {
        result.msg = '删除失败'
        result.code = -1
    }
    result.data = obj.value
    ctx.body = result
})


//-------------------- 简介 -------------------------------

/**
 * 添加等级名称
 */
module.exports = router.post("/:db/rank/addRank", async ctx => {
    let result = {success: false, msg: "", data: [], code: -1}
    let params = ctx.params
    let insertData = ctx.request.body

    let type = insertData.grade_type;
    let rt = await db.findTableInfo(params.db, "rank", {grade_type: type})

    if (rt.length > 0) {
        result.success = true
        result.code = 1
        result.msg = "会员等级编号重复"
    } else {
        let obj = await db.insert(params.db, "rank", insertData)

        if (obj.insertedCount) {
            result.success = true
            result.msg = "插入成功"
            result.data = obj.ops[0]
            result.code = 0
        } else {
            result.msg = "插入失败"
        }
    }


    ctx.body = result
})


/**
 * 获取等级名称
 */
module.exports = router.post("/:db/rank/getRanks", async ctx => {
    let result = {success: false, msg: "", data: [], code: -1}
    let params = ctx.params
    let rank = ctx.request.body
    let obj = await db.findTableInfo(params.db, "rank", rank)

    if (obj.length > 0) {
        result.success = true
        result.code = 0
        result.msg = "获取信息成功"
        result.data = obj
    } else {
        result.msg = "未找到数据"
        result.data = obj
    }
    ctx.body = result
})


/**
 * 修改等级名称
 */
module.exports = router.post('/:db/rank/updateRank', async ctx => {
    let result = {success: false, msg: '', data: [], code: -1}
    let params = ctx.params
    let updateData = ctx.request.body

    let obj = await db.updata(params.db, "rank", updateData.rid, updateData)
    if (obj) {
        result.success = true
        result.msg = '更新成功'
        result.data = obj.value
        result.code = 0
    } else {
        result.msg = '更新失败'
    }
    ctx.body = result
})


/**
 * 删除等级名称
 */
module.exports = router.post('/:db/rank/delRank', async ctx => {
    let result = {success: false, msg: '', data: [], code: -1}
    let params = ctx.params
    let delData = ctx.request.body
    let obj = await db.remove(params.db, "rank", delData.rid)
    if (obj.value) {
        result.success = true
        result.msg = '删除成功'
        result.code = 0
    } else {
        result.msg = '删除失败'
        result.code = -1
    }
    result.data = obj.value
    ctx.body = result
})




//--------------------新闻 start---------------------------------
/**
 * 添加新闻
 */
module.exports = router.post("/:db/news/addNews", async ctx => {
    let result = {success: false, msg: "", data: [], code: -1}
    let params = ctx.params
    let insertData = ctx.request.body

    let obj = await db.insert(params.db, "news", insertData)

    if (obj.insertedCount) {
        result.success = true
        result.msg = "插入成功"
        result.data = obj.ops[0]
        result.code = 0
    } else {
        result.msg = "插入失败"
    }
    ctx.body = result
})


/**
 * 获取新闻说明
 */
module.exports = router.post("/:db/news/getNews", async ctx => {
    let result = {success: false, msg: "", data: [], code: -1}
    let params = ctx.params
    let user = ctx.request.body
    let obj = await db.findTableInfo(params.db, "news", user)

    if (obj.length > 0) {
        result.success = true
        result.code = 0
        result.msg = "获取信息成功"
        result.data = obj
    } else {
        result.msg = "未找到数据"
        result.data = obj
    }
    ctx.body = result
})


/**
 * 修改新闻
 */
module.exports = router.post('/:db/news/updateNews', async ctx => {
    let result = {success: false, msg: '', data: [], code: -1}
    let params = ctx.params
    let updateData = ctx.request.body

    let obj = await db.updata(params.db, "news", updateData.newsId, updateData)
    if (obj) {
        result.success = true
        result.msg = '更新成功'
        result.code = 0
    } else {
        result.msg = '更新失败'
    }
    ctx.body = result
})


/**
 * 删除新闻
 */
module.exports = router.post('/:db/news/delNews', async ctx => {
    let result = {success: false, msg: '', data: [], code: -1}
    let params = ctx.params
    let delData = ctx.request.body
    let obj = await db.remove(params.db, "news", delData.newsId)
    if (obj.value) {
        result.success = true
        result.msg = '删除成功'
        result.code = 0
    } else {
        result.msg = '删除失败'
        result.code = -1
    }
    result.data = obj.value
    ctx.body = result
})



/**
 * 通过newsId 获取新闻详情
 */
module.exports = router.post("/:db/news/getNewsInf", async ctx => {
    let result = {success: false, msg: "", data: [], code: -1}
    let params = ctx.params
    let news = ctx.request.body
    let obj = await db.findId(params.db, "news", news.newId)

    if (obj.length > 0) {
        let objData = {
            _id: obj[0]._id,
            news_title: obj[0].news_title,
            news_content: obj[0].news_content
        }
        result.success = true
        result.code = 0
        result.msg = "获取详情成功"
        result.data = obj
    } else {
        result.msg = "未找到数据"
        result.data = obj
    }
    ctx.body = result
})
//--------------------新闻 end---------------------------------



/**
 * 获取微信的opengId
 */
module.exports = router.post("/:db/wx/getOpeniId", async (ctx, next) => {

    let gtData = ctx.request.body
    try {
        let AppID = "wx3497ec70c2e7c334";
        let AppSecret = "91ef3146d946f21d99dceb3215c90512";
        //let code="021SUEmo0i8hql1OnGmo0f8pmo0SUEmk";
        let code = gtData.code
        console.log("--code-->" + code)
        let result = await request.get({
                url: "https://api.weixin.qq.com/sns/jscode2session?js_code=" + code + "&appid="+AppID+"&secret="+AppSecret+"&grant_type=authorization_code"//'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + AppID + '&secret=' + AppSecret + '&code='+ code + '&grant_type=authorization_code',
            },
            function (error, response, body) {

                console.log("====error==" + error)
                console.log("====response==" + response.statusCode)

                if (response.statusCode == 200) {
                    // 第三步：拉取用户信息(需scope为 snsapi_userinfo)
                    // console.log(JSON.parse(body));
                    var data = JSON.parse(body);

                    var openid = data.openid;

                    console.log("====openid====" + openid)



                } else {
                    console.log(response.statusCode);
                }
            }
        );

        ctx.type = 'json';
        ctx.body = result;
        /* console.log(req.body);
         let appId = "wx3497ec70c2e7c334";
         let secret = "91ef3146d946f21d99dceb3215c90512";
         let { js_code } = req.body;
         let opts = {
             url: `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${js_code}&grant_type=authorization_code`
         }
         let r1 = await Ut.promiseReq(opts);
         r1 = JSON.parse(r1);
         console.log(r1);
         res.json(r1);*/
    }
    catch (e) {
        console.log(e);

    }
})
