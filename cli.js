const scraper = require("./scraperController.js");
const moment = require("moment");

if (process.argv[2]) {
    let day = moment(process.argv[2], "YYYY-MM-DD", true);

    if (day.isValid()
     && day.diff(moment(), "days") < 0) {
        console.log(day.format());
        scraper(day);
    } else {
        console.log("Invalid day");
    }
} else {
    console.log("No day given.");
}
