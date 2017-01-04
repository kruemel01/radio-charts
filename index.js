const Promise = require("bluebird");
const request = require("request-promise");
const cheerio = require("cheerio");
const scraper = require("./scraper.js");
const { db } = require("./db.js");

const initialUrl = "http://www.swr3.de/musik/playlisten";

let day = "2017-01-03";

Promise.all([
    request(initialUrl),
    db.sync(),
])
.then(([html, ]) => {
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
    return Promise.reduce(paramArray, scraper, 0);
})
.then((i) => {
    console.log(`Done. Inserted ${i} records into the database`);
});