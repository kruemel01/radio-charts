const request = require("request-promise");
const cheerio = require("cheerio");
const he = require("he");
const moment = require("moment");
const Promise = require("bluebird");
const { PlaylistItem, Song, Artist } = require("./db.js");

async function insertIntoDatabase(count, { name, artist, time }) {
    
    try {
    
        let [playlistItem, song] = await Promise.all([
            PlaylistItem.find({ where: { time } }),
            Song.find({ where: { name } }),
        ]);

        if (playlistItem && song
         && playlistItem.songId === song.id) {
            console.log(song.name + " " + song.id);
            console.log(playlistItem.time);
            console.log(count);
            throw new Error("Record already in database");
        }

        let _playRecord = PlaylistItem.create({
            time
        });
        let _songRecord = Song.findOrCreate({
            where: {
                name
            },
            defaults: {
                name,
            },
        });
        let _artistRecord = Artist.findOrCreate({
            where: {
                name: artist,
            },
            defaults: {
                name: artist,
            },
        });

        let [playRecord, songRecord, artistRecord] = await Promise.all([_playRecord, _songRecord, _artistRecord]);

        let [,] = await Promise.all([
            playRecord.setSong(songRecord[0]),
            songRecord[1] ? songRecord[0].setArtist(artistRecord[0]) : true,
        ]);

    } catch (err) {
        console.log(err.message);
    }

    return count + 1;
}

module.exports = async function scrape(i, { url, day, hour }, index) {
    console.log(`Requesting ${index}: ${url}?hour=${hour}&date=${day}`);

    let $ = await request({
        uri: `${url}?hour=${hour}&date=${day}`,
        transform(body) {
            return cheerio.load(body);
        }
    });

    let playlistItems = [];

    $("#playlist").children().each((i, el) => {
        let timestamp = $(el).find("time.timestamp").attr("datetime");
        let name = $(el).find("h4[itemprop=name]").html();
        let artist = $(el).find("h5[itemprop=name]").html();
        if (name
         && timestamp
         && artist
         && name.toLowerCase().indexOf("swr3") === -1) {
            name = he.decode(name);
            artist = he.decode(artist);
            let time = moment(timestamp, "YYYY-MM-DD H:mm").toDate();
            playlistItems.push({ name, artist, time });
        }
    });

    console.log(`Website fetched. Inserting ${playlistItems.length} records into the database.`);

    return Promise.reduce(playlistItems, insertIntoDatabase, i);
};