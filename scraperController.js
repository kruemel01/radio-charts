const Promise = require("bluebird");
const request = require("request-promise");
const cheerio = require("cheerio");
const scraper = require("./scraper.js");

const { InvalidArgumentError } = require("./errors.js");

const initialUrl = "http://www.swr3.de/musik/playlisten";

module.exports = async function(date) {
    if (!date || !date.isValid) {
        throw new InvalidArgumentError();
    }

    let day = date.format("YYYY-MM-DD");
    console.log(day);
    let html = await request(initialUrl);
    let $ = cheerio.load(html);
    let url = $("form[action^='http://www.swr3.de/musik/playlisten/']").attr("action");
    let paramArray = [];
    for (let i = 0; i < 24; i++) {
        paramArray.push({
            url,
            day,
            hour: i,
        });
    }
    
    let records = await Promise.reduce(paramArray, scraper, 0);
    console.log(`Done. Inserted ${records} records into the database`);
    return records;
};

