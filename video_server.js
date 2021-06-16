// ---------- ICI C'EST CE QUI SE PASSE AU NIVEAU DU SERVEUR ----------

// Setup basic express server
var express = require("express");
var app = express();
var path = require("path");
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 3000;

const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

server.listen(port, "0.0.0.0");

// Routing
app.use(express.static(path.join(__dirname, "public")));
