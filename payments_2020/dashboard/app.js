const config = require('../config');

module.exports.load = async() => {
    const vhost = require('../vhost');
    const express = require("express");
    const path = require("path");
    const bodyParser = require("body-parser");
    const https = require("https");
    const mainRouter = require("./routes/all");
    const postRouter = require("./routes/post");
    const paymentsRouter = require("./routes/payments");
    const qiwiRouter = require("./routes/qiwi");
    const yandexRouter = require("./routes/yandex");
    const session = require("express-session");
    const cookieParser = require('cookie-parser');
    const passport = require('passport');
    app = express();
    
    passport.serializeUser(function(user, done) {
        done(null, user);
    })
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });
    app.use(passport.initialize());
    app.use(passport.session());
    app
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .engine("html", require("ejs").renderFile)
    .set("view engine", "ejs")
    .use(cookieParser())
    .use(express.static(path.join(__dirname, "/public")))
    .set('views', path.join(__dirname, "/views"))
    .use(session({
        secret: 'faeb4453e5d14fe6f6d04637f78077c76c73d1b4',
        proxy: true,
        resave: true,
        saveUninitialized: true
        })
    )
    .use(vhost(`bot.${config.dashboard.domain}`, function(req, res, next){
        res.redirect(`https://bot.${config.dashboard.domain}:444${req.originalUrl}`);
    }))
    .use(vhost(`bot2.${config.dashboard.domain}`, function(req, res, next){
        res.redirect(`https://bot2.${config.dashboard.domain}:555${req.originalUrl}`);
    }))
    .use(vhost(config.dashboard.domain, function(req, res, next){
        res.render("fydne.xyz/index.ejs");
    }))
    .use("/", postRouter)
    .use("/", mainRouter)
    .use("/", paymentsRouter)
    .use("/", qiwiRouter)
    .use("/", yandexRouter)
    .use(function(req, res){
        if (req.session.user == null){
            res.status(404).render("errors/404.ejs", {
                is_logged: false
            });
        } else {
            res.status(404).render("errors/404.ejs", {
                is_logged: true,
                udata : req.session.user
            });
        }
    })
    .listen(80);
    https.createServer({
        key: require("./crt").key,
        cert: require("./crt").crt,
        passphrase: 'YOUR PASSPHRASE HERE'
    }, app)
    .listen(443);
    //express().use(express.static(path.join(__dirname, "/public"))).use(function(req, res) {
    //    res.redirect('https://' + req.headers.host + req.url);
    //}).listen(80);
};