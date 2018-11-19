//生成订单号
 const generateOrderId = ()=>{
     let num = (~~(Math.random()*100))
     num = num<10?'0'+num:num
     return new Date().getTime() +''+num
}

module.exports = {
    generateOrderId
}
