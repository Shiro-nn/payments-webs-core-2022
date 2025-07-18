const mongoose = require("mongoose");
const logger = require("./helpers/logger");
const config = require("./config");
require("moment-duration-format");

const init = async () => {
    mongoose.connect(config.mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
        logger.log("Connected to the Mongodb database.", "log");
        require("./dashboard/app").load();
        UpdateStats();
    }).catch((err) => {
        logger.log("Unable to connect to the Mongodb database. Error:"+err, "error");
    });
};

init();
process.on("unhandledRejection", (err) => {
    console.error(err);
});
process.on("uncaughtException", (err) => {
    console.error(err);
});
function UpdateStats() {
    PosUpdate();
    setInterval(() => PosUpdate(), 1000 * 60 * 60);
    async function PosUpdate() {
        const statsData = require("./base/stats");
        const dates = require("./dashboard/routes/modules/dates");
        const stats = await statsData.find();
        const date = dates.GetStatsDate();
        stats.filter(x => !x.labels.includes(date)).forEach(async stat => {
            await sleep(1000);
            if(!stat.labels.includes(date)){
                stat.labels.push(date);
                stat.markModified('labels');
                await stat.save();
            }
        });
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }
}