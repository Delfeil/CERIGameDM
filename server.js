/******** Chargement des Middleware
*
********/
const express = require('express'); //Express.js
const pgClient = require('pg');		//BD PGSQL
const sha1 = require('sha1');	//Crytage des mdp
const session = require('express-session');	//Gestion des sessions
const MongoDBStore = require('connect-mongodb-session')(session);	//MongoDB for session
const MongoClient = require('mongodb').MongoClient; //MongoDB for other
const path = require('path');

/******** Declaration des variables
*
********/
const app = express(); // expressJS

const dsnMongoDB = "mongodb://127.0.0.1:27017/db";

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

app.use(express.static(__dirname + '/CERIGame'))

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
	//console.log('Login: ', req.query.login, " mdp: ", req.query.mdp);
	sql= "select * from fredouil.users where identifiant='" + req.query.login + "';";
	pool.connect(function(err, client, done) {
		if(err) {console.log('Error connecting to pg server' + err.stack);}
		else{
		console.log('Connection established with pg db server');
		};
		client.query(sql, function(err, result){
			var responseData = {};
			//console.log("result: ", result, "mdp: ", sha1(req.query.mdp))
			if(err) {
				console.log('Erreur d’exécution de la requete' + err.stack);
			} else if ((result.rows[0] != null) && (result.rows[0].motpasse == sha1(req.query.mdp))) {
				console.log("mot de passe correct");
				if(typeof req.session.user === "undefined") {
					//Si aucuns utilisateur n'est présent dans la bdd MongoDB: on l'incère
					req.session.user = {
						username: req.query.login,
						name: result.rows[0].nom,
						firstName: result.rows[0].prenom,
						id: result.rows[0].id,
						last_connect: null
					};
					responseData.last_connect = req.session.user.last_connect;
				} else {
					//On cherche si l'utilisateur n'est pas déjà présent dans les utilisateurs enregistrés
					console.log("un utilisateur a déjà sa session sur MongoDB: ", req.session.user);
					if(req.session.user.username !== req.query.login) {
						//Si l'utilisateur n'as pas sa session enregistrée sur MongoDBSession: on écrase la précédente
						req.session.user = {
							username: req.query.login,
							name: result.rows[0].nom,
							firstName: result.rows[0].prenom,
							id: result.rows[0].id,
							last_connect: null
						};
					} else {
						responseData.last_connect = req.session.user.last_connect;
					}
				}
				// req.session.isConnected = true;
				// req.session.username = req.query.login;
				// req.session.name = result.rows[0].nom;
				// req.session.firstName = result.rows[0].prenom;
				// req.session.id = result.rows[0].id;

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

app.get('/logout', function(req, res) {
	console.log("déconnexion: last_connect: " + req.query.last_connect);
	if(typeof req.session.user !== "undefined") {
		req.session.user.last_connect = req.query.last_connect;
	} else {
		console.log("utilisateur non présent dans la base de donnée MongoDB...");
	}
	//req.session.destroy();
	res.send();
});

app.get('/resetMongo', function(req, res) {
	req.session.destroy();
	res.send();
});

app.get('/quizz', function(req, res) {
	if(typeof req.session.isConnected === "undefined") {
		res.send({
			message: "Accès non autorisé"
		});
	} else {
		res.sendFile(path.join(__dirname + '/CERIGame/app/views/quizz.html'));
	}
});

app.get('/quizzList', function(req, res) {
	MongoClient.connect(dsnMongoDB, {useNewUrlParser: true}, function(err, mongoClient) {
		if(err) {
			return console.log("erreur connexion base de données");
		}
		if(mongoClient) {
			var reqDB = {};
			mongoClient.db().collection('quizz').find(reqDB).toArray(function(err, data) {
				if(err) return console.log('erreur base de données');
				if(data) {
					console.log('requete ok ');
					mongoClient.close();
					res.send(data);
				}
			});
		}
	});
});

/*//Loadig js files...
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
});*/