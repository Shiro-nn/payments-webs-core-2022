const config = require('../config');

module.exports.load = async() => {
    const express = require("express");
    const path = require("path");
    const bodyParser = require("body-parser");
    const https = require("https");
    const session = require("express-session");
    const cookieParser = require('cookie-parser');
    const passport = require('passport');

    const apiRouter = require("./routes/api");
    const authRouter = require("./routes/authorization");
    const mainRouter = require("./routes/all");
    const shopsRouter = require("./routes/shops");
    const paymentsRouter = require("./routes/payments");
    const checkRouter = require("./routes/check");

    const cdn_host_link = config.dashboard.cdn;
    const cdn_reserve = config.dashboard.cdn_reserve;

    require("./routes/telephone.js").Init();

    app = express();
    
    passport.serializeUser(function(user, done) {
        done(null, user);
    })
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });
    app.use(passport.initialize());
    app.use(passport.session());
    app/*
    .use(function(req, res, next){
        let str = `IP: ${(req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress)?.replace('::ffff:', '')} `;
        str += `Method: ${req.method} `;
        str += `${req.protocol}://${req.get("host")}${req.originalUrl}`;
        console.log(req.body);
        const js = JSON.stringify(req.body);
        if(js?.length > 0) str += `\n${js}`;
        console.log(str)
        next();
    })*/
    .use(function(req, res, next){
        if(req.get("host") != 'qurre.store') return next();
        res.redirect(`https://pay.scpsl.store${req.originalUrl}`);
    })
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
    .use(function(req, res, next){
        let str = `IP: ${(req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress)?.replace('::ffff:', '')} `;
        str += `Method: ${req.method} `;
        str += `${req.protocol}://${req.get("host")}${req.originalUrl}`;
        next();
    })
    .use("/", apiRouter)
    .use("/", authRouter)
    .use("/", mainRouter)
    .use("/", shopsRouter)
    .use("/", paymentsRouter)
    .use("/", checkRouter)
    .use(function(req, res){
        let cdn_host = cdn_host_link;
        if (req.cookies?.cdn != undefined) cdn_host = cdn_reserve;
        res.status(404).render("errors/404.ejs", {cdn_host});
    })
    .use(function(err, req, res, next) {
        let cdn_host = cdn_host_link;
        if (req.cookies?.cdn != undefined) cdn_host = cdn_reserve;
        res.status(500).render("errors/500.ejs", {cdn_host});
        const { Webhook } = require('discord-webhook-node');
        const hook = new Webhook("https://discord.com/api/");
        hook.setUsername('Payments Web'); hook.setAvatar('https://cdn.scpsl.store/qurre/payments.png');
        hook.send(`Произошла ошибка.\nМестоположение: \`${req.protocol}://${req.get("host")}${req.originalUrl}\`\nКод ошибки:\n${err}`);
    })
    .listen(80);
    const server = https.createServer({
        key: require("./crt").key,
        cert: require("./crt").crt,
        passphrase: ''
    }, app);
    server.listen(443);
    require("./socket").load(server);
};