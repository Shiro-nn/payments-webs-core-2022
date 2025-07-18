module.exports = {
    apps : [{
        name   : "qurre",
        script : "./qurre.js",
        exec_mode : "cluster",
        max_memory_restart: "512M"
    }]
}