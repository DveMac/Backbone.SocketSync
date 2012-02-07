
var express 	= require('express'),
	path 		= require('path'),
	_ 			= require('underscore'),
	app 		= express.createServer(), 
	io 			= require('socket.io').listen(app);


app.use(express.static(__dirname + '/../public'));;

app.get('/javascripts/backbone.socketsync.js', function (req, res) {
	var filepath = path.normalize( __dirname + "/../backbone.socketsync.js")
	res.sendfile(filepath);
});

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

var create = function (socket, signature) {
	var e = event('create', signature), data = [];
	socket.emit(e, {id : 1});            
};

var read = function (socket, signature) {
	var e = event('read', signature), data;
	data.push({})
	socket.emit(e, data);            
};

var update = function (socket, signature) {
	var e = event('update', signature), data = [];
	socket.emit(e, {success : true});            
};

var destroy = function (socket, signature) {
	var e = event('delete', signature), data = [];
	socket.emit(e, {success : true});            
};

// creates the event to push to listening clients
var event = function (operation, sig) {
	var e = operation + ':'; 
	e += sig.endPoint;
	if (sig.ctx) e += (':' + sig.ctx);

	return e;
};

io.sockets.on('connection', function (socket) {
	socket.on('create', function (data) {
		create(socket, data.signature);       
	});      
	socket.on('read', function (data) {
		read(socket, data.signature);
	});  
	socket.on('update', function (data) {
		update(socket, data.signature);       
	}); 
	socket.on('delete', function (data) {
		destroy(socket, data.signature);       
	});                
});

app.listen(3000);