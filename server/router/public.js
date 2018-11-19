const router = require('koa-router')()
const db = require('../db/index')
const util = require('../util/index.js')

//添加接口   传query参数 order  会自动生成订单号 
module.exports = router.post('/:db/api/:table',async ctx=>{
  let result ={success: false, msg: '', data: null ,code:-1} 
  let params = ctx.params
  let order = !!ctx.query.order
  let insertData = ctx.request.body
  //生成订单
  insertData = Object.assign(insertData,{_nowtime:new Date().getTime()})
  insertData=order?Object.assign(insertData,{orderId:util.generateOrderId()}):insertData
  let obj=await db.insert(params.db,params.table,insertData)
  if(obj.insertedCount){
    result.success=true
    result.msg='添加成功'
    result.code = 0
    result.data=obj.ops[0]
    result.order=order
  }else{
    result.msg='添加失败'
  }
  ctx.body=result
})

//删除接口
module.exports = router.del('/:db/api/:table/:id', async ctx => {
  let result = {success: false, msg: '', data: null,code:-1 } 
  let params = ctx.params
  let obj=await db.remove(params.db,params.table,params.id)
  if(obj.value){
    result.success=true
    result.msg='删除成功'
    result.code=0
  }else{
    result.msg='删除失败'
    result.code=-1
  }
  result.data = obj.value
  ctx.body = result
})

//通过id找对象
module.exports = router.get('/:db/api/:table/:id', async ctx => {
  let result = {success: false, msg: '', data: null ,code:-1 } 
  let params = ctx.params
  let obj=await db.findId(params.db,params.table,params.id)
  if(obj){
    result.success=true
    result.msg=obj.length?'查询成功':'找不到数据'
    result.data = obj
    result.code=0
  }else{
    result.msg='查询失败'
  }
  ctx.body = result
})

//修改
module.exports = router.put('/:db/api/:table/:id', async ctx => {
  let result = {success: false, msg: '', data: null,code:-1  } 
  let params = ctx.params
  let updateData = ctx.request.body
  let obj=await db.updata(params.db,params.table,params.id,updateData)
  if(obj){
    result.success=true
    result.msg='更新成功'
    result.data = obj
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

//生成订单号
module.exports = router.get('/:db/orderId/',async ctx=>{
  ctx.body ={success: true, msg: '生成订单号', orderId:util.generateOrderId(),code:0 }
})


//找总记录数
module.exports = router.get('/:db/count/:table',async ctx =>{
  let result = {success: true, msg:'', data: null,code:-1  ,total:0}
  let params = ctx.params
  let query = ctx.query
  let filter = query.filter ? JSON.parse(query.filter) :{}
  let total = await db.findCount(params.db,params.table,filter)
      result.msg = `${params.table}表总记录数`
      result.code = 0
      result.total=total
  ctx.body=result
})