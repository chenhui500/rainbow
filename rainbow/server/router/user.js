const router = require("koa-router")();
const db = require('../db/index')
const jwt = require('jsonwebtoken')
const config = require('../config')
const jwsSecret = config.jwsSecret


/**
 * 登录
 */

module.exports = router.post("/:db/login", async ctx => {
   let  result = {success: false, msg: "账号密码错误",code:-1 ,account:{}}
   let  params = ctx.params
   console.log(params)
   let  user = ctx.request.body

   if (user.user == 'rainbow' && user.pwd == 'e10adc3949ba59abbe56e057f20f883e'){
       let profile ={
        user: user.user,
        id: 0
       }
      result.token = jwt.sign(profile, jwsSecret, { expiresIn: 60 * 60 * 24 * 3 /* 1 days */ })
      result.success=true
      result.code=0
      result.msg="登录成功"
      result.account.name = 'luban'
      result.account._id = 0
      result.account.tel = 'luban'
   } 
   result.nowtime = new Date().getTime()
    ctx.body = result
  })