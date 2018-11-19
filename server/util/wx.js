let nwo = require('node-weixin-oauth');
const API = require('wechat-api')
let appId = 'wx7e0aa09a76fe616b'
let secret = '627c04d773a3b2e2f82b2ddd8e16a5f8'
let token = 'yongxinwuye'

let appinfo = {
    id: appId,
    secret,
    token
}
const api = new API(appinfo.id, appinfo.secret)

const getAutoInfo = (code) => {
    return new Promise((r, q) => {
        nwo.success(appinfo, code, function (error, body) {
             r(body)
        })
    })
}

const getUserInfo = (openid, access_token) => {
    return new Promise((r, q) => {
        nwo.profile(openid, access_token, function (error, body) {
            r(body)
        });
    })

}

const refreshToKen  = (refreshToken) =>{
    return new Promise((r, q) => {
        nwo.refresh(appId, refreshToken, function (error, body) {
            r(body)
        })
    })
}

const valToKen  = (openid,Token) =>{
    return new Promise((r, q) => {
        nwo.validate(openid, Token, function (error, body) {   
            console.log(error)  
            r(error)
            
        })
    })
}

//发送模板信息
const sendTemplate = (openid,templateId,url,topcolor,data) =>{
    return new Promise((r, q) => {
       api.sendTemplate(openid,templateId,url,data,function(err,res){
          r({err,res})
       })
    })
 
}



module.exports = {
    appinfo,
    getAutoInfo,
    getUserInfo,
    refreshToKen,
    valToKen,
    sendTemplate
}