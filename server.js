var express = require('express');
var mongo = require('mongodb').MongoClient();
var app = express();
var connection  = 'mongodb://localhost:27017/fcc';
function isValidUrl(userInput) {
  var res = userInput.match(/(http:\/\/.)(www\.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  if(res==null)
    return false;
  else
    return true;
}

app.use(express.static('public'));
mongo.connect(connection,function(err,db){
 var collection = db.collection('urlshortener');
 app.use('/new/*',function (req,res){
  var short_url = req.protocol+"://www."+req.headers.host+req.url;
  var url = (req.params)[0];
   if(err) console.log("Unable to connect");
     collection.findOne({"url" : url},function (err,doc){
     if(err) throw err;
     if(doc){
        short_url = short_url + doc.id;
        var output = {"original_url":url,"short_url":short_url};
        res.json(output);
     }
     else {
       if(!isValidUrl(url)){
          res.end("Please enter a valid url ");
       }
       else {
        collection.stats(function (err, stats) {
          var id = stats.count + 1 + 1000;
          var json = {"url":url,"id":id};
          short_url = short_url + id;
          var output = {"original_url":url,"short_url":short_url};
          collection.insertOne(json,function (err,data){
            console.log("Inserted into db");
            res.json(output);
          });
        });
       }
     }
   });
 });
 app.get('/*',function (req,res){
   var id = req.params[0];
   collection.findOne({"id":Number(id)},function (err,doc){
     if(err) throw err;
     if(doc){
       res.redirect(doc.url);
     }
     else {
       res.end("Short url has not been created!");
     }
   });
 })
});
app.listen(8080);
