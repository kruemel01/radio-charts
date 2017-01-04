const Sequelize = require("sequelize");

let db = new Sequelize("radiocharts", "root", "root", {
    host: "localhost",
    dialect: "mariadb",
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
    logging: false,
});

let PlaylistItem = db.define("PlaylistItem", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    time: {
        type: Sequelize.DATE,
    },
}, {
    indexes: [
        {
            fields: ["time"],
        },
    ],
});

let Song = db.define("Song", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: Sequelize.STRING,
    },
}, {
    indexes: [
        {
            unique: true,
            fields: ["name"],
        },
    ],
});

let Artist = db.define("Artist", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: Sequelize.STRING,
    },
}, {
    indexes: [
        {
            unique: true,
            fields: ["name"],
        },
    ],
});

PlaylistItem.belongsTo(Song, { foreignKey: "song_id" });
Song.hasMany(PlaylistItem, { foreignKey: "song_id" });

Song.belongsTo(Artist, { foreignKey: "artist_id" });
Artist.hasMany(Song, { foreignKey: "artist_id" });


module.exports = { db, PlaylistItem, Song, Artist };