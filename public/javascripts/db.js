var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var insertDocuments = function(db, coll, docs, callback) {
  // Takes the passed array of JSON documents and writes them to the 
  // specified collection

  // Access the collection
  var collection = db.collection(coll);

  // Verify that it's really an array
  if (!Array.isArray(docs)) {
  	console.log(docs + "Data is not an array");
  	callback(false);
  } else {

  	// Insert the array of documents
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
	// Connect to the database and then insert the documents from the array

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
	// Returns a document from the collection

	MongoClient.connect(uri, function(err, db) {
		if (err != null) {
			console.log("Database Error: " + err.message);
			callback (false);
		} else {
			console.log("Connected succesfully to server");
			console.log("Reading record from " + coll + " collection");
			var collection = db.collection(coll);

			// Read the document from MongoDB
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