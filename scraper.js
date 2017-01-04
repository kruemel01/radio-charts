const request = require("request-promise");
const cheerio = require("cheerio");
const he = require("he");
const moment = require("moment");
const Promise = require("bluebird");
const { PlaylistItem, Song, Artist } = require("./db.js");


module.exports = function scrape(i, { url, day, hour }, index) {
    console.log(`Item ${index}: ${url}?hour=${hour}&date=${day}`);
    return request(`${url}?hour=${hour}&date=${day}`)
    .then(html => {
        let $ = cheerio.load(html);

        let playlistItems = []

        $("#playlist").children().each((i, el) => {
            let timestamp = $(el).find("time.timestamp").attr("datetime");
            let name = $(el).find("h4[itemprop=name]").html();
            let artist = $(el).find("h5[itemprop=name]").html();
            if(name
            && timestamp
            && artist
            && name.toLowerCase().indexOf("swr3") === -1) {
                name = he.decode(name);
                artist = he.decode(artist);
                let time = moment(timestamp, "YYYY-MM-DD H:mm").toDate();
                console.log(time);
                playlistItems.push({ name, artist, time });
            }
        });
        return Promise.reduce(playlistItems,
        (count, { name, artist, time }) => {
            let playRecord = PlaylistItem.create({
                time
            });
            let songRecord = Song.findOrCreate({
                where: {
                    name
                },
                defaults: {
                    name,
                },
            });
            let artistRecord = Artist.findOrCreate({
                where: {
                    name: artist,
                },
                defaults: {
                    name: artist,
                },
            });
            return Promise.all([playRecord, songRecord, artistRecord])
            .then(([playRecord, songRecord, artistRecord]) => {
                return Promise.all([
                    playRecord.setSong(songRecord[0]),
                    songRecord[1] ? songRecord[0].setArtist(artistRecord[0]) : true,
                ]);
            })
            .then(() => {
                return count + 1;
            });
        }, i);
    });
};