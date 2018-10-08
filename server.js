/******** Chargement des Middleware
*
********/
const express = require('express'); //Express.js

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
