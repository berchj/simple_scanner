const express = require('express')
const app = express()
const port = 4550
const router = require('./routes/router')
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.json())
app.use('/api',router)
app.listen(port,()=>{
    console.info(`server running on ${port}`)
})