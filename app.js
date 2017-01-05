const Koa = require("koa");
const send = require("koa-send");

const { db } = require("./db.js");
const api = require("./api.js");

async function init() {
    console.log("Starting application...");
    await db.sync();
    console.log("Database sync complete.");
    console.log("Listening on 8080");
    app.listen(8080);
}

const app = new Koa();

// Output human-readable error information
app.use(async function(ctx, next) {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = `${err.message} (${ctx.status})`;
    }
});

// Attach API router routes (prefixed with /api/)
app.use(api.routes());

// Wait for generic file serving to finish, if no filepath is
// matched (status === 404), serve index.html
app.use(async function(ctx, next) {
    await next();
    if (ctx.status === 404) {
        await send(ctx, "radio-charts-client/dist/index.html");
    }
});

// If available, send matching file from client/dist directory
app.use(async function(ctx) {
    await send(ctx, ctx.path, { root: "radio-charts-client/dist"});
});

init();