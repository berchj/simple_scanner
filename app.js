const express = require('express')
const app = express()
const port = 4550
const router = require('./routes/PrivateRouter')
const session = require('express-session')
const oneDay = 1000 * 60 * 60 * 24
const privateRouter = require('./routes/PrivateRouter')
const publicRouter = require('./routes/PublicRouter')
app.use(express.urlencoded({extended:true}))
app.use(session({
    secret: 'MySecretToken',
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
}))
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.json())
app.use('/api', privateRouter)
app.use('/api', publicRouter)
app.listen(port, () => {
    console.info(`server running on ${port}`)
})