/******** Chargement des Middleware
*
********/
const express = require('express'); //Express.js
//const path = require('path');

/******** Declaration des variables
*
********/
const app = express(); // expressJS

/******** Configuration du serveur NodeJS - Port : 3xxx
*
********/
var server=app.listen(3101, function() {
	console.log('listening on 3101');
});

/******** Gestion des URI
*
********/
var abs_path= '/home/nas02a/etudiants/inf/uapv1602054/CERIGAme/CERIGame/';
app.get('/', function(req, res) {
	console.log('load page /')
	/*res.send('index.html');*/
	res.sendFile(abs_path + "index.html");
});

app.get('/login', function(req, res) {
	console.log('Login: ', req.query.login, " mdp: ", req.query.mdp);
	res.send();
	
	// test
});