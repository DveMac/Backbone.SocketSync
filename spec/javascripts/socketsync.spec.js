describe("socket sync initialization", function(){
  var Model = Backbone.Model.extend();

  beforeEach(function(){
    io = jasmine.getGlobal().io;
  });

  describe("when an invalid socket argument is provided", function(){
    it("should raise an error", function(){
      expect(Backbone.SocketSync.createSync).toThrow("An io socket or url string must be specified");
      expect(function(){Backbone.SocketSync.createSync(1);}).toThrow("An io socket or url string must be specified");
      expect(function(){Backbone.SocketSync.createSync('Cats!!');}).toThrow("A valid url must be specified");
    });
  });

  describe("when an socket.io is unavailable", function(){
    it("should raise an error", function(){
     expect(function(){Backbone.SocketSync.createSync('http://localhost:3000');}).toThrow("Socket.IO library is missing");
    });
  });

  describe("when an socket.io is available", function(){
    beforeEach(function(){
      io.connect = function(url){
        return new Object();
      };
    });

    it("should return a sync method", function(){
     expect(_.isFunction(Backbone.SocketSync.createSync('http://localhost:3000'))).toBeTruthy();
    });
  });
});
