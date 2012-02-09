
var express 	= require('express'),
	path 		= require('path'),
	_ 			= require('underscore'),
	app 		= express.createServer();
var	io 			= require('socket.io').listen(app);


app.use(express.static(__dirname + '/../public'));;

app.get('/javascripts/backbone.socketsync.js', function (req, res) {
	var filepath = path.normalize( __dirname + "/../backbone.socketsync.js")
	res.sendfile(filepath);
});

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.get('/client.js', function (req, res) {
	res.sendfile(__dirname + '/client.js');
});

var database = [{
		id: 100,
		title: 'Hello',
		content: 'OHAI!'
	}, {
		id: 101,
		title: 'Hola',
		content: 'Adios'
	}, {
		id: 102,
		title: 'Word up',
		content: 'yoyoyoyoyoy'
	}];


var socketCommands = [
	{
		name: 'create',
		handler: function(data){
			var rec = {};
			_.extend(rec, data.item, {id:database.length + 101});
			database.push(rec);
			return rec;
		}
	},
	{
		name: 'read',
		handler: function(data){
			return database;
		}
	},
	{
		name: 'update',
		handler: function(data){
			_.each(database, function(r,i,l){
				if(r.id == data.item.id){
					_.extend(l[i],data.item);
				}
			});
			return {success : true};
		}
	},
	{
		name: 'delete',
		handler: function(data){
			return {success : true};
		}
	}
];

var event = function (operation, sig) {
	var e = operation + ':' + sig.endPoint;
	if (sig.ctx) e += (':' + sig.ctx);

	return e;
};

io.sockets.on('connection', function (socket) {
	_.each(socketCommands, function(command){
		socket.on(command.name, function(data){
			var e = event(command.name, data.signature);
			delete data.signature;
			socket.emit(e, command.handler(data));    
		});
	}, this);           
});

app.listen(3000);