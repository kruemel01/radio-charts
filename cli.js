const scraper = require("./scraperController.js");
const moment = require("moment");
const { db } = require("./db.js");

async function run() {
    await db.sync();
    if (process.argv[2] && process.argv[3]) {
        let start = moment(process.argv[2], "YYYY-MM-DD", true);
        let end = moment(process.argv[3], "YYYY-MM-DD", true);
        if (start.isValid()
         && end.isValid()
         && start.diff(end, "days") < 0
         && end.diff(moment(), "days") < 0) {
            while (start.diff(end, "days") <= 0) {
                await scraper(start);
                start = start.add(1, "days");
            }
        } else {
            console.log("Invalid date range");
        }
    } else if (process.argv[2]) {
        let day = moment(process.argv[2], "YYYY-MM-DD", true);

        if (day.isValid()
        && day.diff(moment(), "days") < 0) {
            scraper(day);
        } else {
            console.log("Invalid day");
        }
    } else {
        console.log("No day given.");
    }
}

run();