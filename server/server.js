const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const ObjectID = require('mongodb').ObjectID; 
let currentCollection;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://drone_logs:drone_logs@cluster0.fibfm.mongodb.net/drone_logs?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
	currentCollection = client.db("DB_billSplit").collection("tbl_Login");
	console.log("database Up!");
});


app.post('/signup', function (req, res) {
	currentCollection = client.db("DB_billSplit").collection("tbl_Login");
	currentCollection.insertOne(req.body, function (err, result) {
		if (err) {
			console.log(err);
		}
		else {
            
            console.log("New user added :\n" + JSON.stringify(req.body));
			res.send(req.body);
		}
	})
});

app.get('/login/email/:email/password/:password', function (req, res) {

	currentCollection = client.db("DB_billSplit").collection("tbl_Login");
    var queryVal = { email: req.params.email,
                     password: req.params.password};

	currentCollection.find(queryVal).toArray(function (err, result) 
	{
		if (err) 
		{
			console.log(err);
			res.send(err);
		}
		else 
		{
			if(result.length != 0)
			{
				console.log("\nClient logged in useing this credentials: ");
				console.log("Email: "+result[0].email + " Password: " + result[0].password);
				res.send(result);
			}
			else
			{
				res.send(result);
				console.log("\nIncorrect credentials from client side!");

			}
		}
	})
});

app.get('/loadusers', function (req, res) 
{
	currentCollection = client.db("DB_billSplit").collection("tbl_Login");
    currentCollection.find().toArray(function (err, result) {
		if (err) {
			console.log(err);
		}
		else {
			res.send(result);
			console.log("\nAvailable users:");
			for(var i=0; i<result.length; i++)
			{
				console.log(result[i].firstname + " " + result[i].lastname);
			}
		}
	})
});

app.post('/addbill', function (req, res) {
	currentCollection = client.db("DB_billSplit").collection("tbl_bills");

	currentCollection.insertOne(req.body, function (err, result) {
		if (err) {
			console.log(err);
		}
		else 
		{
            console.log("\nBills add to cloud :\n" + JSON.stringify(req.body));
			res.send(req.body);
		}
	})
});

app.get('/loadbilldata/:payer', function (req, res) 
{
	currentCollection = client.db("DB_billSplit").collection("tbl_bills");
	var query = {payer: req.params.payer}
    currentCollection.find(query).toArray(function (err, result) {
		if (err) {
			console.log(err);
		}
		else 
		{
			if(result.length != 0)
			{
				console.log("\nBills in database where payer is "+req.params.payer+": \n"+JSON.stringify(result));
			}
			else
			{
				console.log("No data found");
			}
			res.send(result);
		}
	})
});

app.get('/loadbilldata', function (req, res) 
{
	currentCollection = client.db("DB_billSplit").collection("tbl_bills");
    currentCollection.find().toArray(function (err, result) {
		if (err) {
			console.log(err);
		}
		else 
		{
			console.log("\nAll bills in database: \n"+JSON.stringify(result));
			res.send(result);
		}
	})
});

app.post('/deletebill/:id', function (req, res) 
{
	currentCollection = client.db("DB_billSplit").collection("tbl_bills");
	
	currentCollection.deleteOne({_id: new ObjectID(req.params.id)}, function (err, result) 
	{
		if (err) {
			console.log(err);
		}
		else {
            
            console.log("\nBill has been deleted.");
			res.send(req.body);
		}
	})
});

app.listen(3000, () => {
	console.log("Web server started on port 3000");
});