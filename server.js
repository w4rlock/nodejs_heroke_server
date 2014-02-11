var express = require('express'),
    request = require('request'),
    cheerio = require('cheerio'),
    Ticketek = require('./concert.js').Ticketek,
    app = express(),
    Cache = require('cache-storage'),
    FileStorage = require('cache-storage/Storage/FileSyncStorage')

app.use(express.logger());
app.use(express.compress());
app.use(express.methodOverride());
app.use(express.bodyParser());

var cache = new Cache(new FileStorage('./cache'), 'namespace');

function cacheSave(key,value,expire){
  var oexpires = { minutes: 10};
  //moment({years: 2010, months: 3, days: 5, hours: 15, minutes: 10, seconds: 3, milliseconds: 123});
  cache.save(key.toUpperCase(),value, {expire: oexpires});
}

function cacheGet(key){
  return cache.load(key.toUpperCase());
}


//------------------------- ROUTES ------------------------------//
app.use(express.static(__dirname + '/public'));

app.get('/concerto/:evento', function(req, res){
  var cach = cacheGet(req.params["evento"]);
  if (cach == null){
    var con = new Ticketek(req.params);
    con.getAllPage(function(result){ 
      cacheSave(req.params["evento"], result, null);
      res.json(result);
    });
  }
  else{
    res.send(cach);
  }
});

app.get('/concerto/:evento/:numpage', function(req, res){
  var con = new Ticketek(req.params);
  con.getPage(
    function(result){ 
      res.json(result);
    },2);
});

app.get('/', function(req, res) {
  res.send(app.routes);
});

app.get('/*', function(req, res){
  res.sendfile('./public/404.html');
});
//------------------------- ROUTES ------------------------------//

var port = process.env.PORT || 8081;
app.listen(port, function() { console.log("Listening on " + port); });
