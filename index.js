"use strict";

let WebSocketServer = require("websocket").server;
let http = require("http");
let firebase = require("firebase");

firebase.initializeApp({
  serviceAccount: "firebase-credentials.json",
  databaseURL: "https://pet-ball.firebaseio.com/"
});

let httpServer = http.createServer();

let server = new WebSocketServer({
  httpServer: httpServer,
  autoAcceptConnections: true
});

var connections = {web: {}, pet: {}};

server.on("connect", function(connection) {
  var uid;
  var type;
  connection.on("message", function(payload) {
    var data = JSON.parse(payload.utf8Data);
    firebase.auth().verifyIdToken(data.token).then(function(token) {
      delete data.token;
      console.log(data);
      if (data.hello) {
        uid = token.uid;
        type = data.hello;
        connections[type][uid] = connection;
      } else {
        connections[(type == "web") ? "pet" : "web"][uid].send(JSON.stringify(data));
      }
    });
  });
});

httpServer.listen(3000);
