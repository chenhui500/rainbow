const Koa = require('koa')
const fs = require('fs')
const https = require('https');
const enforceHttps = require('koa-sslify');

const bodyParser = require('koa-bodyparser')
const app = new Koa()
const router = require('./router/index')

const cors = require('koa-cors')
const jwt = require('jsonwebtoken')
const jwtKoa = require('koa-jwt')
const config = require('./config')
const serve = require('koa-static')
const path = require('path')

const jwsSecret = config.jwsSecret


// app.use(jwtKoa({  jwsSecret}).unless(
//     { path: [/^\/api\/login/]
//         //数组中的路径不需要通过jwt验证
// }))

/*
//https 请求需要的密钥
var options = {
    key: fs.readFileSync('/usr/local/src/rainbow/server/yxwy.key'),
    cert: fs.readFileSync('/usr/local/src/rainbow/server/yxwy.pem')
};
*/




//解决跨域 http 请求
app.use(cors())

app.use(serve(path.join(__dirname+'/../public')));  //使用静态服务器

app.use(bodyParser())  //使用ctx.body解析中间件
//设置路由
app.use(router.routes()).use(router.allowedMethods())

app.listen(config.port)

/*
//解决跨域 https 请求
app.use(cors())

app.use(serve(path.join(__dirname+'/../public')));  //使用静态服务器

app.use(bodyParser())  //使用ctx.body解析中间件
//设置路由
app.use(router.routes()).use(router.allowedMethods())

https.createServer(options, app.callback()).listen(8680);
console.log('[demo] route-use-middleware is starting at port 8680')*/
