const router = require("koa-router")()
const multer = require('koa-multer') 
const images = require('images')

console.log(__dirname)
var storage = multer.diskStorage({
    //文件保存路径  
   destination: function (req, file, cb) {  
     cb(null, __dirname+'/../../public/img')  
   },
    //修改文件名称  
    filename: function (req, file, cb) {  
     var fileFormat = (file.originalname).split('.')  
     cb(null,Date.now() + '.' + fileFormat[fileFormat.length - 1])  
   } 
 })
 
 //加载配置  
 var upload = multer({ storage })

 //图片上传
 module.exports = router.post('/upload', upload.single('file'), async (ctx, next) => {  
    let filename = ctx.req.file.filename//返回文件名  
    images(__dirname+'/../../public/img/'+filename).size(400).save(__dirname+'/../../public/img/min_'+filename,{quality : 50}) //压缩图片
    ctx.body = {  
        code:0,
        msg:'上传成功',
        minFilename:'min_'+filename,
        filename
    }  
  })  