const router = require('koa-router')()
const public = require('./public')
const user = require('./user')
const upload = require('./upload')

const wx = require('./wx')
router.use('', user.routes(), user.allowedMethods())
router.use('', public.routes(), public.allowedMethods())
router.use('', upload.routes(), upload.allowedMethods())
router.use('', wx.routes(), wx.allowedMethods())

module.exports = router