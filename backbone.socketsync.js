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

	var urlRegex = /^(https?:\/\/)[a-zA-Z0-9\.\:\/]*$/,
			overrideKey = '__socketsync';

	var signature = function (model) {
		var sig = {},
				url = _.isFunction(model.url) ? model.url() : model.url;   

		sig.endPoint = url + (model.id ? ('/' + model.id) : '');
		if (model.ctx) sig.ctx = model.ctx;

		return sig;
	};

	var event = function (operation, sig) {
		var e = operation + ':' + sig.endPoint;
		if (sig.ctx) e += (':' + sig.ctx);

		return e;
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

	var isOverridden = function(scope){
		return (scope.sync || backbone.sync).hasOwnProperty(overrideKey);
	}

	var wrapBackbone = function(){
		_.extend(backbone.Model.prototype, {
			save: _.wrap(backbone.Model.prototype.save, function(func,key,value,options){
				if (isOverridden(this)){
					(options || value || (value = {})).wait = true;
				}

				return func.apply(this, [key, value, options]);	
			}),
			destroy: _.wrap(backbone.Model.prototype.destroy, function(func,options){
				if (isOverridden(this)){
					(options || (options = {})).wait = true;
				}

				return func.apply(this, [options]);	
			})	
		});
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

		if(!iosocket.emit){
			throw getError("NoSocketError", "Invalid socket object");
		}

		wrapBackbone();

		iosocket.on('broadcast', function(data){
			console.log(data);
		});

		var syncMethod = function (method, model, options) {
			var sign = signature(model);
			var e = event(method, sign);
			
			try{
				iosocket.emit(method, {'signature' : sign, item : model.toJSON() }); 
				iosocket.once(e, function (data) {
	        options.success(data);
				}); 
			} catch (err){
				options.error(getError("SocketError"),err);
			}  
		};

		syncMethod.__socketsync = "socketsync";

		return syncMethod;
	};

	return SocketSync;
})(Backbone, _);
