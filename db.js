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

PlaylistItem.belongsTo(Song, { foreignKey: "songId" });
Song.hasMany(PlaylistItem, { foreignKey: "songId" });

Song.belongsTo(Artist, { foreignKey: "artistId" });
Artist.hasMany(Song, { foreignKey: "artistId" });


module.exports = { db, PlaylistItem, Song, Artist };