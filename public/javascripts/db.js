var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var insertDocuments = function(db, coll, docs, callback) {
  var collection = db.collection(coll);
  if (!Array.isArray(docs)) {
  	console.log(docs + "Data is not an array");
  	callback(false);
  } else {
  	collection.insertMany(docs, function(err, result) {
      if (err != null) {
  			console.log("Database Error: " + err.message);
  			callback(false, err.message);
  		} else {
   		   console.log("Inserted " + result.result.n + " documents into the collection: " + coll);
  		    callback(true);
  		}
    });
  }
};

exports.popCollection = function (uri, collection, docs, callback) {
	MongoClient.connect(uri, function(err, db) {
		if (err != null) {
			console.log("Database Error: " + err.message);
			callback (false, err.message);
		} else {
		 	console.log("Connected succesfully to server");
			insertDocuments(db, collection, docs, function(result) {
		    	db.close();
			 	console.log("Closed database connection");
			 	callback(result);
		  	});
		}
	});
};

exports.sampleDoc = function (uri, coll, callback) {
	MongoClient.connect(uri, function(err, db) {
		if (err != null) {
			console.log("Database Error: " + err.message);
			callback (false);
		} else {
			console.log("Connected succesfully to server");
			console.log("Reading record from " + coll + " collection");
			var collection = db.collection(coll);
			collection.findOne({}, function(err, doc) {
				if (err != null) {
					console.log("Database Error: " + err.message);
					callback({}, err.message);
				} else {
					console.log(doc);
					callback(doc);
				}
			})
		}
	})
}