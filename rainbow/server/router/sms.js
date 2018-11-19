const router = require('koa-router')()
const SMSClient = require('@alicloud/sms-sdk')

//记录手机号与验证码
const CodeMap = new Map()
const liveTime = 2 * 60 * 60 * 1000 //验证码的有效时间 2h


const accessKeyId = 'LTAIMrq9iMYUEYMf'
const secretAccessKey = 'm8Hp6L0LFITep2qRCJaZzumV1JXMdq'




//生成一串随机数
const setCode = (i) => {
  return new Array(i).fill().map(i => ~~(Math.random() * 10)).join('')
}



//获取验证码  1分钟 内不能重复请求
module.exports = router.get('/sms/:tel', async ctx => {
  let result = {
    success: false,
    msg: '',
    data: null,
    code: -1
  }
  let smsClient = new SMSClient({
    accessKeyId,
    secretAccessKey
  })
  let tel = ctx.params.tel
  let code =  CodeMap.has(tel) ?  CodeMap.get(tel).code : setCode(5)
  if(CodeMap.has(tel) && ( (new Date().getTime() - CodeMap.get(tel).time <(60*1000)) )){
    result.msg='不能一直请求'
    
  }else{
    await smsClient.sendSMS({
      PhoneNumbers: tel,
      SignName: '永兴物业',
      TemplateCode: 'SMS_98060016',
      TemplateParam: `{"code":${code}}`
    }).then(function (res) {
      let { Code} = res
      if (Code === 'OK') {
        //定时 过期时间 删除验证码
        if(!CodeMap.has(tel)){
          setTimeout(() => { CodeMap.has(tel) && CodeMap.delete(tel) ; console.log('del') }, liveTime) //定时器 清除code码
        }
        CodeMap.set(tel,{code,time:new Date().getTime()}) 
        result.success = true
        result.msg = '发送成功'
        result.code = 0
        console.log(res)
      }
    }, function (err) {
      console.log(err)
      switch(err.code){
        case 'isv.MOBILE_NUMBER_ILLEGAL':result.msg='电话号码错误' ;break;
        default :result.msg ='发生了未知的错误，请稍后在试' 
      }  
    })

  }
  ctx.body = result
})

//验证验证码 
module.exports = router.get('/valsms/:tel/:code', async ctx => {
  let result = {
    success: false,
    msg: '',
    data: null,
    code: -1
  }

  let tel = ctx.params.tel
  let code = ctx.params.code
  if (CodeMap.has(tel)) {
    if (CodeMap.get(tel).code == code) {
      result.success = true
      result.msg = '验证成功'
      result.code = 0

    } else {
      result.msg = '验证码错误'
    }
  } else {
    result.msg = '未请求送验证码'
  }

  ctx.body = result

})