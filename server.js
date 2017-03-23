var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var express = require('express');

// app.get('/', function(req, res){
//   res.sendfile(__dirname + '/index.html');
// });
var data={};
var root = path.join(__dirname, 'src');
console.log('Root is : ', root);
app.use(express.static(root));

// io.on('connection', function(socket){
//   socket.on('chat message', function(msg){
//   	console.log("### Got Message: ", msg);
//     //io.emit('chat message', msg);
//     // sending to all clients except sender
// 	socket.broadcast.emit('chat message', msg);
//   });
// });
io.on('connection', function(socket){
  console.log("Client connected: ", socket.id);
  socket.emit('connected', data);
  
  
  socket.on('message', function(msg){
  	console.log("### Got Message: ", msg);
    //io.emit('chat message', msg);
    // sending to all clients except sender
    data = msg;
	socket.broadcast.emit('message', msg);
  });
  
  socket.on('disconnect', function(reason){
    console.log("Client disconnecte: ", socket.id);  
    console.log('Client: ', reason);
  });

});


http.listen(1340, function(){
  console.log('listening on *:1340');
});



// var express = require("express");
// var app = new express();
// var http = require('http');
// var path = require('path');

// var io = require('socket.io')(http);



// app.use(express.static(path.join(__dirname, '../src')));


// // app.get('/', function(req, res){
// //   res.sendfile(__dirname + '/index.html');
// // });

// io.on('connection', function(socket){
//   socket.on('chat message', function(msg){
//     io.emit('chat message', msg);
//   });
// });
// http.createServer(app).listen(1340, function(){
//   console.log('listening on *:1340');
// });
