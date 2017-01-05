const Router = require("koa-router");
const moment = require("moment");
const scrape = require("./scraperController.js");
const { PlaylistItem, Song, Artist } = require("./db.js");

const { NotFoundError, InvalidRequestError } = require("./errors.js");

const api = new Router({ prefix: "/api/" });

api.get("scrape/:date", async function(ctx) {
    if (ctx.params.date) {
        const date = moment(ctx.params.date, "YYYY-MM-DD", true);
        if (date.isValid() && date.diff(moment(), "days") < 0) {
            scrape(date);
            ctx.body = "Scraping...";
        } else {
            throw new InvalidRequestError();
        }
    }
});

api.get("played/:id", async function(ctx) {
    if (ctx.params.id
    && ctx.params.id.match(/[0-9]+/)) {
        let playedItem = await PlaylistItem.findById(ctx.params.id);
        ctx.body = playedItem.time;
    }
});

// Get all routes under /api/ to prevent web client being served.
// Throw NotFoundError for error information.
api.get("*", async function() {
    throw new NotFoundError("API resource not found.");
});

module.exports = api;