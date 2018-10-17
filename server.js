/******** Chargement des Middleware
*
********/
const express = require('express'); //Express.js
const pgClient = require('pg');		//BD PGSQL
const sha1 = require('sha1');	//Crytage des mdp
const session = require('express-session');	//Gestion des sessions
const MongoDBStore = require('connect-mongodb-session')(session);	//MongoDB for session
const path = require('path');

/******** Declaration des variables
*
********/
const app = express(); // expressJS
app.use(session({
	//	Initialisation de la session
	secret: 'ma phrase secrete',
	saveUninitialized: false,
	resave: false,
	store: new MongoDBStore({
		uri: "mongodb://127.0.0.1:27017/db",
		collection: 'mySession_3101',
		touchAfter: 24 * 3600
	}),
	cookie: {
		maxAge: 24 * 3600 * 1000
	}
}));

var pool = new pgClient.Pool({
	user: 'uapv1602054',
	host: '127.0.0.1',
	database: 'etd',
	password: 'M6rozk',
	port: 5432 
});


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
	res.sendFile(path.join(__dirname + '/CERIGame/index.html'));
});

app.get('/login', function(req, res) {
	console.log('Login: ', req.query.login, " mdp: ", req.query.mdp);
	sql= "select * from fredouil.users where identifiant='" + req.query.login + "';";
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
				req.session.username = req.query.login;
				req.session.name = result.rows[0].nom;
				req.session.firstName = result.rows[0].prenom;
				req.session.id = result.rows[0].id;

				responseData.name=result.rows[0].nom;
				responseData.username = req.query.login;
				responseData.firstName = result.rows[0].prenom;
				responseData.statusMsg='Connexion réussie : bonjour ' + result.rows[0].prenom;
			} else {
				console.log('Connexion échouée : informations de connexion incorrecte');
				responseData.statusMsg='Connexion échouée : informations de connexion incorrecte';
			}
			res.send(responseData);
		});
		client.release();
	});
});

//Loadig js files...
app.get('/app/controllers/controller.js', function(req, res) {
	res.sendFile(path.join(__dirname + '/CERIGame/app/controllers/controller.js'));
});

app.get('/app/app.js', function(req, res) {
	res.sendFile(path.join(__dirname + '/CERIGame/app/app.js'));
});

app.get('/app/services/services.js', function(req, res) {
	res.sendFile(path.join(__dirname + '/CERIGame/app/services/services.js'))
});

app.get('/css/main.css', function(req, res) {
	res.sendFile(path.join(__dirname + '/CERIGame/css/main.css'))
});