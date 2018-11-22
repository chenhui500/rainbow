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
    //console.log("----obj.insertedCount->"+obj.insertedCount)
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

//--------------------预约 start---------------------------------
/**
 * 添加预约表单信息
 */
module.exports = router.post("/:db/order/addOrder", async ctx => {
    let  result = {success: false, msg: "",data: [] ,code:-1 }
    let  params = ctx.params
    let  orders = ctx.request.body

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

    if(orders.orderlist.length>0){
        orders.orderlist.forEach(function(item,index){
            //console.log(item+'---'+index);
            //用户名称
            item = Object.assign(item,{user_name:orders.user_name})
            //用户手机
            item = Object.assign(item,{user_phone:orders.user_phone})

            //用户微信授权ID
            item = Object.assign(item,{openid:orders.openid})
            //用户ID
            item = Object.assign(item,{uid:orders.uid})
            //参加活动ID
            item = Object.assign(item,{policyid:orders.policyid})
            //参加活动结束日期
            item = Object.assign(item,{end_date:orders.end_date})

            //推荐状态 1 已推荐 2 已上门 3 已成交 4失效
            item = Object.assign(item,{recommended_state:"1"})
            //推荐状态 1套餐90天活动
            item = Object.assign(item,{policy_type:"1"})
            //创建时间
            var time=moment().format("YYYY-MM-DD")
            //console.log("--time->"+time)
            item=Object.assign(item,{create_time:time})
            //console.log("--item->"+item)
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


/**
 * 获取推荐信息列表
 */
module.exports = router.post("/:db/order/getOrderList", async ctx => {
    let  result = {success: false, msg: "",data: [] ,code:-1 }
    let  params = ctx.params
    let  orders = ctx.request.body
    let obj=await db.findTableInfo(params.db,"order",orders)

    if(obj.length>0){
        result.success=true
        result.code=0
        result.msg="获取信息成功"
        result.data = obj
    }else{
        result.msg="未找到数据"
        result.data = obj
    }
    ctx.body = result
})

/**
 * 通过id获取推荐详情信息
 */

module.exports = router.post('/:db/order/getOrderById', async ctx => {
    let result = {success: false, msg: '', data: null ,code:-1 }
    let params = ctx.params
    let  orders = ctx.request.body
    let id=orders.orderid
    let obj=await db.findId(params.db,"order",id)
    if(obj.length>0){
        result.success=true
        result.msg='获取数据成功'
        result.data = obj
        result.code=0
    }else{
        result.msg='获取数据不成功'
    }
    ctx.body = result
})

/**
 * 修改推荐信息
 */
module.exports = router.post('/:db/order/updateOrder', async ctx => {
    let result = {success: false, msg: '', data: null,code:-1  }
    let params = ctx.params
    let updateData = ctx.request.body

    let obj=await db.updata(params.db,"order",updateData.orderid,updateData)
    if(obj.modifiedCount>0){
        result.success=true
        result.msg='更新成功'
        result.code=0
    }else{
        result.msg='更新失败'
    }
    ctx.body = result
})



//必带参数 pageNum ,pageSize, filter    不传pageNum or pageSize 当做全部查
module.exports = router.get('/:db/api/:table',async ctx =>{
    let result = {success: false, msg: '', data: null,code:-1  ,total:0}
    let params = ctx.params
    let query = ctx.query

    let pageNum = query.pageNum?parseInt(query.pageNum) : ''
    let pageSize = query.pageSize?parseInt(query.pageSize) : ''
    let filter = query.filter ? JSON.parse(query.filter) :{}
    //console.log("---pageNum--"+pageNum+"--pageSize--"+pageSize+"--filter--"+filter)
    let obj =null

    if(pageNum && pageSize){
        obj = await db.findTablePage(params.db,params.table,filter,pageNum,pageSize)
    }else{
        obj = await db.findTableList(params.db,params.table,filter)
    }
    let total=  await db.findCount(params.db,params.table,filter)

    if(obj){
        result.success=true
        result.msg=obj.length?'查询成功':'找不到数据'
        result.data = obj
        result.code=0
        result.total = total
    }else{
        result.msg='查询失败'
    }

    ctx.body=result
})



//-------------------预约 end---------------------------------------

//--------------------参加活动 start---------------------------------
/**
 * 添加参加活动表
 */
module.exports = router.post("/:db/policy/addPolicy", async ctx => {
    let  result = {success: false, msg: "",data: [] ,code:-1 }
    let  params = ctx.params
    let  insertData = ctx.request.body
    //推荐状态 1套餐90天活动
    /*insertData = Object.assign(insertData,{policy_type:"1"})*/
    let obj=await db.insert(params.db,"policy",insertData)
    //console.log("-obj.insertedCount-"+obj.insertedCount)
    if(obj.insertedCount){
        result.success=true
        result.msg="插入成功"
        result.data=obj.ops[0]
        result.code=0
    }else{
        result.msg="插入失败"
    }
    ctx.body = result
})


/**
 * 获取参加活动表
 */
module.exports = router.post("/:db/policy/getPolicy", async ctx => {
    let  result = {success: false, msg: "",data: [],code:-1 }
    let  params = ctx.params
    let  user = ctx.request.body
    let obj=await db.findTableInfo(params.db,"policy",user)

    if(obj.length>0){
        result.success=true
        result.code=0
        result.msg="获取信息成功"
        result.data = obj
    }else{
        result.msg="未找到数据"
        result.data = obj
    }
    ctx.body = result
})

//--------------------参加活动 end---------------------------------

//--------------------推荐奖励说明 start---------------------------------
/**
 * 添加参加活动表
 */
module.exports = router.post("/:db/reward/addReward", async ctx => {
    let  result = {success: false, msg: "",data: [] ,code:-1 }
    let  params = ctx.params
    let  insertData = ctx.request.body
    /*//推荐状态 1套餐90天活动
    insertData = Object.assign(insertData,{policy_type:"1"})*/
    let obj=await db.insert(params.db,"reward",insertData)
    //console.log("-obj.insertedCount-"+obj.insertedCount)
    if(obj.insertedCount){
        result.success=true
        result.msg="插入成功"
        result.data=obj.ops[0]
        result.code=0
    }else{
        result.msg="插入失败"
    }
    ctx.body = result
})


/**
 * 获取参加活动表
 */
module.exports = router.post("/:db/reward/getRewards", async ctx => {
    let  result = {success: false, msg: "",data: [],code:-1 }
    let  params = ctx.params
    let  user = ctx.request.body
    let obj=await db.findTableInfo(params.db,"reward",user)

    if(obj.length>0){
        result.success=true
        result.code=0
        result.msg="获取信息成功"
        result.data = obj
    }else{
        result.msg="未找到数据"
        result.data = obj
    }
    ctx.body = result
})

//--------------------推荐奖励说明 end---------------------------------

/**
 * 获取时间间隔多少天
 */
module.exports = router.post("/:db/intervalDays", async ctx => {
    let  result = {success: false, msg: "",data: [],code:-1 }
    let  data = ctx.request.body
    let pickDate = moment(data.date);
    let diff = pickDate.diff(moment(), 'days');//相差几天

    result.success=true
    result.code=0
    result.msg="获取信息成功"
    result.data = diff

    ctx.body = result
})
