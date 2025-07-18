module.exports.load = async() => {
    const express = require("express");
    const path = require("path");
    const bodyParser = require("body-parser");
    const https = require("https");
    const mainRouter = require("./routes/all");
    app = express();
    app
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .engine("html", require("ejs").renderFile)
    .set("view engine", "ejs")
    .use(express.static(path.join(__dirname, "/public")))
    .set('views', path.join(__dirname, "/views"))
    .use("/", mainRouter)
    .use(function(req, res){
        res.status(404).send("404");
    }).listen(80);
    https.createServer({
        key: require("./crt").key,
        cert: require("./crt").crt,
        passphrase: ''
    }, app)
    .listen(443);
};