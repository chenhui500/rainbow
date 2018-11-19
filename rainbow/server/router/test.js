const router = require('koa-router')()
const db = require('../db/index')

/**
 * 测试
 */

// module.exports = router.post("/text", async ctx => {
//     let ooo=await db.insert('mogodbDemo','test',[{'zhenghui':1,'zhengsf':2}])
//     ctx.body = ooo
//   })

//   module.exports = router.delete("/text", async ctx => {
//     let ooo=await db.remove('mogodbDemo','test',"5a4a26a364591e45d83a4e91")
//     ctx.body = ooo
//   })

//   module.exports = router.put("/text", async ctx => {
//     let ooo=await db.updata('mogodbDemo','test',"5a4a26a264591e45d83a4e90",{zhenghui:2222})
//     ctx.body = ooo
//   })

//   module.exports = router.get("/text", async ctx => {
//     let ooo=await db.findId('mogodbDemo','test',"5a4a26a264591e45d83a4e90")
//     ctx.body = ooo
//   })

//   module.exports = router.get('/page', async ctx =>{
//     let ooo = await db.findTablePage('mogodbDemo','test',{'zhenghui':11111},1,10)
//     let total = await db.findTableList('mogodbDemo','test',{'zhenghui':11111})
//     ctx.body = total.length
//   })

  // module.exports =router.get('/testdb',async ctx =>{
  //   let ooo = await db.findTablePage('management','employee',{},1,10)
  //   ctx.body = ooo
  // })
