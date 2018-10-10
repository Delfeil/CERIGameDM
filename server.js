/******** Chargement des Middleware
*
********/
const express = require('express'); //Express.js
//const path = require('path');
const pgClient = require('pg');		//BD PGSQL
const sha1 = require('sha1');	//Crytage des mdp

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
	sql= "select * from fredouil.users where identifiant='" + req.query.login + "';";
	var pool = new pgClient.Pool({
		user: 'uapv1602054',
		host: '127.0.0.1',
		database: 'etd',
		password: 'M6rozk',
		port: 5432 
	});
	pool.connect(function(err, client, done) {
		if(err) {console.log('Error connecting to pg server' + err.stack);}
		else{
		console.log('Connection established with pg db server');
		};
		client.query(sql, function(err, result){
			var responseData = {};
			console.log("result: ", result, "mdp: ", sha1(req.query.mdp))
			if(err) {
				console.log('Erreur d’exécution de la requete' + err.stack);
			} else if ((result.rows[0] != null) && (result.rows[0].motpasse == sha1(req.query.mdp))) {
				console.log("mot de passe correct");
				req.session.isConnected = true;
				responseData.data=result.rows[0].nom;
				responseData.statusMsg='Connexion réussie : bonjour' + result.rows[0].prenom;
			} else {
				console.log('Connexion échouée : informations de connexion incorrecte');
				responseData.statusMsg='Connexion échouée : informations de connexion incorrecte';
			}
			res.send(responseData);
		});
		client.release();
	});
});