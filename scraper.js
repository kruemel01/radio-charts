const request = require("request-promise");
const cheerio = require("cheerio");
const he = require("he");
const moment = require("moment");
const Promise = require("bluebird");
const Spinner = require("cli-spinner");
const { PlaylistItem, Song, Artist } = require("./db.js");

module.exports = function scrape(i, { url, day, hour }, index) {
    let spinner = new Spinner(`Requesting ${index}: ${url}?hour=${hour}&date=${day} %s`);
    spinner.setSpinnerString(1);
    spinner.start();

    return request(`${url}?hour=${hour}&date=${day}`)
    .then(html => {
        let $ = cheerio.load(html);

        let playlistItems = [];

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
                playlistItems.push({ name, artist, time });
            }
        });

        spinner.stop();
        console.log(`Website fetched. Inserting ${playlistItems.length} records into the database.`);
        return Promise.reduce(playlistItems,
        (count, { name, artist, time }) => {
            return Promise.all([
                PlaylistItem.find({
                    where: {
                        time,
                    },
                }),
                Song.find({
                    where: {
                        name,
                    },
                }),
            ])
            .then(([playlistItem, song]) => {
                if (playlistItem && song
                && playlistItem.songId === song.id) {
                    console.log(song.name + " " + song.id);
                    console.log(playlistItem.time);
                    console.log(count);
                    throw new Error("Record already in database");
                }
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
            })            
            .then(([playRecord, songRecord, artistRecord]) => {
                return Promise.all([
                    playRecord.setSong(songRecord[0]),
                    songRecord[1] ? songRecord[0].setArtist(artistRecord[0]) : true,
                ]);
            })
            .then(() => {
                return count + 1;
            })
            .catch(err => {
                console.log(err.message);
                return count;
            });
        }, i);
    });
};