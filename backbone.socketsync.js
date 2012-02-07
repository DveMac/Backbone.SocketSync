// Backbone.SocketSync v0.1.0

Backbone.SocketSync = (function(backbone, _){
	var SocketSync = {};

	SocketSync.version = "0.1.0";

	var io = {};

	if(!window.io) {
		window.io = io;
	} else {
		io = window.io;
	}

	var urlRegex = /^(https?:\/\/)[a-zA-Z0-9\.\:\/]*$/;

	var signature = function (model) {
		var sig = {};   

		sig.endPoint = model.url + (model.id ? ('/' + model.id) : '');
		if (model.ctx) sig.ctx = model.ctx;

		return sig;
	};

	var event = function (operation, sig) {
		var e = operation + ':';
		e += sig.endPoint;
		if (sig.ctx) e += (':' + sig.ctx);

		return e;
	};   
	
	var socketaction = function (socket, method, model, options) {
		var sign = signature(model);
		var e = event(method, sign);
		socket.emit(method, {'signature' : sign, item : model.attributes }); // model.attribues is the model data
		socket.once(e, function (data) {
			console.log(data);                    
		});                          
	};   
	
	var tryGetSocketFromString = function(url) {
    if(!urlRegex.test(url)) {
      throw getError("InvalidUrl", "A valid url must be specified");
    }

    if(!io.connect) {
      throw getError("NoSocketError", "Socket.IO library is missing");
    }    

    return io.connect(url);
	};      

	var getError = function(name, msg){
		var err = new Error(msg);
    err.name = name;
    return err;
	};

	// createSync
  // --------------

  // 
  // 

	SocketSync.createSync = function(iosocket){
		if(!iosocket || (!_.isString(iosocket) && !_.isObject(iosocket))) {
      throw getError("NoSocketError", "An io socket or url string must be specified");
    }

		if(_.isString(iosocket)){
			iosocket = tryGetSocketFromString(iosocket);
		}

		return function (method, model, options) {
			socketaction(iosocket, method, model, options);
		};
	};

	return SocketSync;
})(Backbone, _);
