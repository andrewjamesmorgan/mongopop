var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var db = require('../public/javascripts/db')
var getIP = require('external-ip')();
var request = require("request");
var publicIP;
var title = "MongoPop – Populate your MongoDB Atlas Database"

getIP(function (err, ip) {
    if (err) {
        // every service in the list has failed 
        throw err;
    }
    console.log(ip);
    publicIP = ip;
});

exports.index = function(req, res) {
	res.render('pop', {title: title, ip: publicIP});
};

exports.add_pop = function(req, res) {

	var mongodbURI = req.body.uri;
	console.log("Provided URI: " + mongodbURI);
	var password = req.body.password;
	var databaseName = req.body.database;
	var docURL = req.body.url;
	var collectionName = req.body.collection;
	var batchSize = req.body.batchSize;
	var batchesCompleted = 0;
	var success = true;
	var error;

	if (!databaseName) {
		databaseName = "mongoproc";
	};

	if (!collectionName) {
		collectionName = "simples";
	}

	// Check for localhost or 127.0.0.1 before making any of these changes
	if (mongodbURI === "mongodb://localhost:27017") {
		if (databaseName) {
			mongodbURI = mongodbURI + "/" + databaseName + "?authSource=admin";
			console.log("localhost URI with database: " + mongodbURI);
		}
	} else {
		mongodbURI = mongodbURI.replace('admin', databaseName);
		mongodbURI = mongodbURI + '&authSource=admin';
		console.log("URI with database: " + mongodbURI);
	};

	if (password) {
		mongodbURI = mongodbURI.replace('PASSWORD', password);
		//console.log("URI with password: " + mongodbURI);
	};

	if (!docURL) {
		docURL = "http://www.mockaroo.com/c8c3d650/download?count=1000&key=a9b4b620";
	};

	// Can be problems with https - this is random sample data so by
	// definition shouldn't need to be private
	docURL = docURL.replace('https', 'http');

	for (i = 0; i < batchSize; i++) {
		request({url: docURL, json: true}, function (error, response, body) {
		    if (!error && response.statusCode === 200) {
				db.popCollection(mongodbURI, collectionName, body, function (result, err){
					if (result) {
						console.log('Wrote Mock data batch');
						batchesCompleted++;
					} else {
						console.log('Failed to write batch');
						console.log(result);
						batchesCompleted++;
						success = false;
						error = err;
					};
					console.log(batchesCompleted + ' batches completed out of ' + batchSize);
					if (batchesCompleted == batchSize) {
						if (result) {
							console.log('Wrote all Mock data');
							db.sampleDoc(mongodbURI, collectionName, function(doc) {
								res.render('pop', {
									title: title, 
									data: 'Wrote ' + batchSize + '000 documents to MongoDB.', 
									previousURL: docURL,
									previousURI: req.body.uri,
									previousPassword: password,
									previousDatabase: databaseName,
									previousCollection: collectionName,
									previousBatchSize: batchSize,
									ip: publicIP,
									sampleDoc: JSON.stringify(doc, null, 4)});
							})
						} else {
							console.log('Failed to write all Mock data');
							console.log(result);
							res.render('pop', {
								title: title, 
								data: 'Problem writing to the database: ' + '"' + error + '"', 
								previousURL: docURL,
								previousURI: req.body.uri,
								previousPassword: password,
								previousDatabase: databaseName,
								previousCollection: collectionName,
								ip: publicIP});
						};
					}
				});
		    }
		});
	};
};
