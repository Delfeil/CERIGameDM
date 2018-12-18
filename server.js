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

/*******
*	Configuration du webSocket
*******/
var io = require('socket.io').listen(server); // définit le middleware socket.io et le serveur avec lequel la connexion full-duplex doit être établie

io.on('connection', function (socket) { // ouverture de la connexion full-duplex disponible dans le paramètre socket
	console.log('connexion socket.oi');
	socket.on("notification client", function (data) {
		console.log(data);
	});
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
	var sql= "select * from fredouil.users where identifiant='" + req.query.login + "';";
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
						last_connect: null,
						avatar: result.rows[0].avatar
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
							last_connect: null,
							avatar: result.rows[0].avatar
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
				responseData.id=result.rows[0].id;
				responseData.username = req.query.login;
				responseData.firstName = result.rows[0].prenom;
				responseData.statusMsg='Connexion réussie : bonjour ' + result.rows[0].prenom;
				responseData.avatar= result.rows[0].avatar;
				io.emit('notification_connexion', req.query.login +  " vient de se connecter.");
			} else {
				console.log('Connexion échouée : informations de connexion incorrecte');
				responseData.statusMsg='Connexion échouée : informations de connexion incorrecte';
				//io.emit('notification_erreur', 'Erreur de Connexion');
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

app.get('/quizzTheme', function(req, res) {
	MongoClient.connect(dsnMongoDB, {useNewUrlParser: true}, function(err, mongoClient) {
		if(err) {
			return console.log("erreur connexion base de données");
		}
		if(mongoClient) {
			var themeOnly = {
				'thème': 1
			};
			var reqDB = {
				thème: { $exists: true }
			};
			mongoClient.db().collection('quizz').find({}).project({'thème':1}).toArray(function(err, data) {
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

app.get('/historique', function(req, res) {
	if(typeof req.session.user !== 'undefined') {
		var sql= "select * from fredouil.historique where id_users='" + req.session.user.id + "'  order by date DESC;";
		pool.connect(function(err, client, done) {
			if(err) {
				console.log('Error connecting to pg server' + err.stack);
			} else {
				console.log('Connection established with pg db server');
			}
			client.query(sql, function(err, result){
				var responseData = {};
				//console.log("result: ", result, "mdp: ", sha1(req.query.mdp))
				if(err) {
					console.log('Erreur d’exécution de la requete' + err.stack);
				} else if (result.rows[0] != null) {
					console.log("requete réussie: " + JSON.stringify(result));
					var scoreTotal = 0;
					for(var row in rows) {
						scoreTotal += row.score;
					}
					responseData.scoreTotal = scoreTotal;
				}
				res.send(responseData);
			});
			client.release();
		});
	}
});

app.get('/saveScore', function(req, res) {
	console.log("save score")
	var score = req.query.score;
	var idQuizz = req.query.idQuizz;
	var nbBonneReponse = req.query.nbReponse;
	var tempS = req.query.tempS;
	var sql= "insert into fredouil.historique ( id_users, date, nbreponse, temps, score) values ('" + req.session.user.id + "', LOCALTIMESTAMP, '" + nbBonneReponse + "', '" + tempS + "', '" + score + "');";
	console.log("save score, sql: ", sql)
	pool.connect(function(err, client, done) {
			if(err) {
				console.log('Error connecting to pg server' + err.stack);
			} else {
				console.log('Connection established with pg db server');
			}
			client.query(sql, function(err, result){
				var responseData = {};
				//console.log("result: ", result)
				if(err) {
					console.log('Erreur d’exécution de la requete' + err.stack);
				} else {
					responseData.statusMsg = "Sauvegarde du score";
				}
				res.send(responseData);
			});
			client.release();
		});
});

app.get('/top10_best', function(req, res) {
	//Page donnant les meilleurs scores

	var sql= "select DISTINCT(id_users), score, date, temps, nbreponse, identifiant, nom, prenom, avatar from fredouil.historique left join fredouil.users on fredouil.historique.id_users = fredouil.users.id order by score DESC FETCH FIRST 10  ROWS ONLY;";
	pool.connect(function(err, client, done) {
		if(err) {
			console.log('Error connecting to pg server' + err.stack);
		} else {
			console.log('Connection established with pg db server');
		}
		client.query(sql, function(err, result){
			var responseData = {};
			console.log("result: top10 best ", result)
			if(err) {
				console.log('Erreur d’exécution de la requete' + err.stack);
			} else if (result.rows[0] != null) {
				console.log("requete réussie: " + JSON.stringify(result));
				responseData.topBest = result.rows;
			}
			res.send(responseData);
		});
		client.release();
	});
});

app.get('/top10_tot', function(req, res) {
	//Page donnant les meilleurs scores cumulés

	// var sql= "select SUM(score) as somme_score, id_users from fredouil.historique left join fredouil.users on fredouil.historique.id_users = fredouil.users.id group by id_users order by somme_score DESC FETCH FIRST 10 ROWS ONLY;";
	var sql= "select SUM(score) as somme_score, id_users, identifiant, avatar from fredouil.historique left join fredouil.users on fredouil.historique.id_users = fredouil.users.id group by id_users, identifiant, avatar order by somme_score DESC FETCH FIRST 10 ROWS ONLY;";
	pool.connect(function(err, client, done) {
		if(err) {
			console.log('Error connecting to pg server' + err.stack);
		} else {
			console.log('Connection established with pg db server');
		}
		client.query(sql, function(err, result){
			var responseData = {};
			console.log("result: top 10 sumScore", result)
			if(err) {
				console.log('Erreur d’exécution de la requete' + err.stack);
			} else if (result.rows[0] != null) {
				console.log("requete réussie: " + JSON.stringify(result));
				responseData.topSum = result.rows;
			}
			res.send(responseData);
		});
		client.release();
	});
});

app.get('/sumScore', function(req, res) {
	var idUser = req.query.idUser;
	if(typeof idUser == "undefined") {
		res.send({
			message: "erreur d'argument"
		});
		return;
	}
	var sql= "select SUM(score) from fredouil.historique where id_users= "+idUser+";";
	pool.connect(function(err, client, done) {
		if(err) {
			console.log('Error connecting to pg server' + err.stack);
		} else {
			console.log('Connection established with pg db server');
		}
		client.query(sql, function(err, result){
			var responseData = {};
			console.log("result: scoreTotal ", result)
			if(err) {
				console.log('Erreur d’exécution de la requete' + err.stack);
			} else if (result.rows[0] != null) {
				console.log("requete réussie: " + JSON.stringify(result));
				responseData.sumScore = result.rows[0].sum;
			}
			res.send(responseData);
		});
		client.release();
	});
});

app.get('/bestScore', function(req, res) {
	var idUser = req.query.idUser;
	if(typeof idUser == "undefined") {
		res.send({
			message: "erreur d'argument"
		});
		return;
	}
	console.log("erreur: ", typeof idUser)
	// var sql= "select * from fredouil.historique where id_users =" + idUser + " order by score DESC FETCH FIRST 3 ROWS ONLY;";
	var sql = "select * from fredouil.historique left join fredouil.users on fredouil.historique.id_users = fredouil.users.id where id_users = " + idUser + " order by score DESC FETCH FIRST 3 ROWS ONLY;"
	pool.connect(function(err, client, done) {
		if(err) {
			console.log('Error connecting to pg server' + err.stack);
		} else {
			console.log('Connection established with pg db server');
		}
		client.query(sql, function(err, result){
			var responseData = {};
			console.log("result: user bests Scores ", result)
			if(err) {
				console.log('Erreur d’exécution de la requete' + err.stack);
			} else if (result.rows[0] != null) {
				console.log("requete réussie: " + JSON.stringify(result));
				responseData.bestScores = result.rows;
			}
			res.send(responseData);
		});
		client.release();
	});
});

app.get('/updateUser', function(req, res) {
	var sql = "UPDATE fredouil.users SET ";
	var precedent = false;
	var empty = true;
	if(typeof req.query.identifiant !== "undefined") {
		if(precedent) {
			sql +=", ";
		}
		sql+="identifiant='" + req.query.identifiant + "' ";
		precedent = true;
		empty = false;
	}
	if(typeof req.query.nom !== "undefined") {
		if(precedent) {
			sql +=", ";
		}
		sql+="nom='" + req.query.nom + "' ";
		precedent = true;
		empty = false;
	}
	if(typeof req.query.prenom !== "undefined") {
		if(precedent) {
			sql +=", ";
		}
		sql+="prenom='" + req.query.prenom + "' ";
		precedent = true;
		empty = false;
	}
	if(typeof req.query.avatar !== "undefined") {
		if(precedent) {
			sql +=", ";
		}
		sql+="avatar='" + req.query.avatar + "' ";
		precedent = true;
		empty = false;
	}
	if(empty) {
		console.log("Rien à modifier");
		res.send({
			message: "erreur, Rien à modifier"
		});
		return;
	}
	if(typeof req.session.user.id == "undefined") {
		res.send({
			message: "erreur d'argument"
		});
		return;
	}
	sql = sql + "WHERE id = '" + req.session.user.id + "';";
	pool.connect(function(err, client, done) {
		if(err) {
			console.log('Error connecting to pg server' + err.stack);
			res.send({
				message: 'Error connecting to pg server' + err.stack
			});
			return;
		} else {
			console.log('Connection established with pg db server');
		}
		client.query(sql, function(err, result){
			var responseData = {};
			console.log("result: user bests Scores ", result)
			if(err) {
				console.log('Erreur d’exécution de la requete' + err.stack);
				res.send({
					message: 'Erreur d’exécution de la requete' + err.stack
				});
				return;
			} else {
				console.log("Modifications réussies: " + JSON.stringify(result));
				responseData.userModif = {};
				responseData.message = "modifications validées";
				if(typeof req.query.identifiant !== "undefined") {
					req.session.user.username = req.query.identifiant;
					responseData.userModif.username = req.query.identifiant;
				}
				if(typeof req.query.nom !== "undefined") {
					req.session.user.name = req.query.nom;
					responseData.userModif.name = req.query.nom;
				}
				if(typeof req.query.prenom !== "undefined") {
					req.session.user.firstName = req.query.prenom;
					responseData.userModif.firstName = req.query.prenom;
				}
				if(typeof req.query.avatar !== "undefined") {
					req.session.user.avatar = req.query.avatar;
					responseData.userModif.avatar = req.query.avatar;
				}
			}
			res.send(responseData);
		});
		client.release();
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