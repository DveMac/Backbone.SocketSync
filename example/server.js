
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
			var rec = {};
			_.each(database, function(r,i,l){
				if(r.id == data.item.id){
					rec = _.extend(l[i],data.item);
				}
			});
			return rec;
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
console.log(e);
	return e;
};

io.sockets.on('connection', function (socket) {
	_.each(socketCommands, function(command){
		socket.on(command.name, function(data){
			var e = event(command.name, data.signature);
			delete data.signature;
			var response = command.handler(data);
			socket.emit(e, response); 
			if(command.name !== 'read'){
				socket.broadcast.emit('broadcast', response);   
			}
		});
	}, this);           
});

app.listen(3000);