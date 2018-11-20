const router = require("koa-router")();
const db = require('../db/index')
const jwt = require('jsonwebtoken')
const config = require('../config')
const jwsSecret = config.jwsSecret
var moment = require('moment');

/**
 * 通过openid 获取用户信息
 */
module.exports = router.post("/:db/user/getUserInfo", async ctx => {
    let  result = {success: false, msg: "",data: [],code:-1 }
    let  params = ctx.params
    let  user = ctx.request.body
    let obj=await db.findTableInfo(params.db,"user",user)

    if(obj.length>0){
        result.success=true
        result.code=0
        result.msg="获取用户信息成功"
        result.data = obj
    }else{
        result.msg="未找到数据"
        result.data = obj
    }
    ctx.body = result
})


/**
 * 注册授权用户基本信息
 */
module.exports = router.post("/:db/user/addUser", async ctx => {
    let  result = {success: false, msg: "",data: [],code:-1 }
    let  params = ctx.params
    let  user = ctx.request.body
    let obj=await db.insert(params.db,"user",user)
    console.log("----obj.insertedCount->"+obj.insertedCount)
    if(obj.insertedCount>0){
        result.success=true
        result.code=0
        result.msg="注册用户成功"
        result.data = obj.ops[0]
    }else{
        result.msg="注册用户失败"
        result.data = obj
    }
    ctx.body = result
})

/**
 * 添加预约表单信息
 */
module.exports = router.post("/:db/order/addOrder", async ctx => {
    let  result = {success: false, msg: "",data: [] ,code:-1 }
    let  params = ctx.params
    let  orders = ctx.request.body
    console.log(orders.uid)
    let obj=await db.findId(params.db,"policy",orders.uid)

    console.log("------------->"+obj.length)
    if(obj.length>0){

    }
    //获取当前时间往前推移90天
    var date=moment().add(90,'days').calendar();
    var d=moment(date).format('YYYY-MM-DD')
    console.log("==ddd=="+d)

    if(orders.orderlist.length>0){
        orders.orderlist.forEach(function(item,index){
            console.log(item+'---'+index);
            //用户名称
            item = Object.assign(item,{user_name:orders.user_name})
            //用户手机
            item = Object.assign(item,{user_phone:orders.user_phone})
            //推荐状态 1 已推荐 2 已上门 3 已成交 4失效
            item = Object.assign(item,{recommended_state:"1"})
            //推荐状态 1套餐90天活动
            item = Object.assign(item,{policy_type:"1"})
            //创建时间
            var time=moment().format("YYYY-MM-DD")
            item=Object.assign(item,{create_time:time})

            db.insert(params.db,"order",item)
        });
        result.success=true
        result.msg="提交成功"
        result.code=0
    }else{
        result.msg="提交不成功"
    }

    ctx.body = result
})



