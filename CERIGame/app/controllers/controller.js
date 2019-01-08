
/**---Controleur du bandeau
* Reçoie un événement avec un message à afficer et si c'est une erreur ou non,
* Affiche ce message et change la classe du bandeau en fonction de la nature du message (erreur ou non)
*/
function bandeau_controller($scope, session) {
	$scope.messageTab = [];
	$scope.message = {
		msg: null,
		class: null
	};
	$scope.running = false;
	$scope.secondMessage = false;

	/**
	*	Réinitialisation du bandeau
	*/
	$scope.reset = function(callback) {
		$scope.message.msg = "";
		$scope.message.class = "hide";
		if(typeof callback == "function") {
			callback();
		}
		$scope.$apply();
	}

	/**
	*	Affichage d'un message
	*/
	$scope.showMessage = function() {
		$scope.running = true;
		var message = $scope.messageTab.shift();
		if(message.type == "error") {
			$scope.message.class = "error";
		} else if(message.type == "message") {
			$scope.message.class = "bandeau-notif";
		}
		$scope.message.msg = message.msg;
		if($scope.secondMessage) {
			$scope.$apply();
		}

		console.log("Message affiché: ", $scope.message.msg, $scope.message.class)
		setTimeout(function() {
			if($scope.messageTab.length != 0) {
				$scope.reset();
				setTimeout(function() {
					$scope.$apply(function() {
						$scope.showMessage();
					});
				}, 2000)
			} else {
				$scope.secondMessage = false;
				$scope.running = false;
				$scope.message.msg = "";
				$scope.message.class = "hide";
				$scope.$apply();
			}
		}, 6500);
	}

	/**
	*	Evenement de réception d'un message
	*/
	$scope.$on('getMessage', function(event, data) {
		console.log("Bandeau message reçu, ", event, data, "message ", data.msg, "type: ", data.type, "messageTab: ", $scope.messageTab, $scope.messageTab.length, "comp ", $scope.messageTab.length > 0);
		if($scope.messageTab.length > 0) {
			for(var i=0; i<$scope.messageTab.length; i++) {
				var message = $scope.messageTab[i];
				if(message.msg !== data.msg) {
					$scope.messageTab.push(data);
				}
			}
			if(!$scope.running) {
				$scope.showMessage();
			}
		} else {
			$scope.messageTab.push(data);
			if(!$scope.running) {
				$scope.showMessage();
			}
		}
	});
}

//------------Controleur page d'acceuil
//	Récupération des données relatives aux dfférents TOP10
function accueil_controller($scope, accessDataService) {
	$scope.tot10Best = null;
	$scope.top10Sum = null;

	// Initialisation de l'acceuil
	$scope.reloadAcceuil = function() {
		$scope.getTop10Sum();
		$scope.getTop10Best();
	}

	// Récupération du top 10 avec les joueurs aillant réaliser un des meilleurs score
	$scope.getTop10Best = function() {
		accessDataService.getInfo('/top10_best', function(data) {
			console.log("result: getBest", data)
			$scope.tot10Best = data.topBest;
		});
	}

	// Récupération du top 10 avec les joueurs aillant le score cumulé le plus élevé
	$scope.getTop10Sum = function() {
		accessDataService.getInfo('/top10_tot', function(data) {
			console.log("result: getBest", data)
			$scope.tot10Sum = data.topSum;
		});
	}

	// Récupération de l'événement transmis par le main controleur demandant d'afficher l'acceuil
	$scope.$on('showAcceuil', function() {
		console.log("click event : acceuil");
		$scope.reloadAcceuil();
	});
	$scope.reloadAcceuil();
}

//-----------Controleur quizz
function quizz_controller($scope, session, accessDataService, $rootScope) {
	$scope.quizzs = null;
	$scope.themes = [];
	$scope.searchQuizz = true;
	$scope.questionQuizz = false;
	$scope.showEnd = false;

	$scope.defis = null;
	$scope.showDefis = false;
	$scope.usersDefiant = null;
	$scope.defiCase = false;
	$scope.showDefier = false;
	$scope.showUserDefier = false;
	$scope.usersDefier = null;

	$scope.selectedQuizz = null;
	$scope.question = null;
	$scope.questionAffiche = null;

	$scope.debut = null;
	$scope.nbBonneReponse = 0;

	$scope.nbQuestion = 5;

	$scope.score = 0;

	$scope.numQuestion = -1;

	$scope.tempS = 0;

	$scope.difficulte = "facile";

	$scope.chronoStop = false;
	$scope.nbH = 0;
	$scope.nbM = 0;
	$scope.nbS = 0;

	$scope.setDifficulte = function(difficulte) {
		$scope.difficulte = difficulte;
	}

	$scope.getQuizzes = function() {
		$scope.showDefis = false;
		if(session.getInfo('all_quizz') == null) {
			accessDataService.getInfo('/quizzList', function(data) {
				console.log("result: ", data)
				$scope.quizzs = data;
				session.setInfo('all_quizz', data);
			});
		} else {
			$scope.quizzs = session.getInfo('all_quizz');
		}
	}

	$scope.recupUsersInfo = function(userId, callback) {
		if(typeof $scope.usersDefiant.userId == "undefined") {
			accessDataService.getInfo('/getOtherUser?userId=' + userId, function(dataUser) {
				console.log("resultOtherUser: ", dataUser.user)
				$scope.usersDefiant.userId = dataUser.user;
				// $scope.defis[i]['infoUser'] = {};
				// $scope.defis[i]['infoUser'] = dataUser.user;
				if(typeof callback == "function") {
					callback($scope.usersDefiant.userId);
				}
			});
		}
	}

	$scope.getDefis = function() {
		accessDataService.getInfo('/getDefis', function(data) {
			console.log("result: ", data)
			$scope.defis = data;
			$scope.showDefis = true;
			$scope.quizzs = null;
			/*$scope.usersDefiant = {};
			for(var i=0; i<$scope.defis.length; i++) {
				var userId = $scope.defis[i].userDefiant;
				$scope.recupUsersInfo(userId, function(userInfo) {
					console.log("userInfo: ", userInfo);
					$$scope.defis[i].infoUser = userInfo;
					console.log("User info get: ", $scope.defis, "user defiant: ", $scope.usersDefiant);
				});

				// gérer la récup de + d'infos depuis le serveur nodeJs


				/*if(typeof $scope.usersDefiant.userId == "undefined") {
					accessDataService.getInfo('/getOtherUser?userId=' + userId, function(dataUser) {
						console.log("resultOtherUser: ", dataUser.user)
						$scope.usersDefiant.userId = dataUser.user;
						// $scope.defis[i]['infoUser'] = {};
						// $scope.defis[i]['infoUser'] = dataUser.user;
					});
				} else {
				}
				$scope.defis[i].infoUser = $scope.usersDefiant.userId;
			}*/

		});
	}

	$scope.getThemes = function() {
		if(session.getInfo('quizzThemes') == null) {
			accessDataService.getInfo('/quizzTheme', function(data) {
				console.log("recup Themes: ", data)
				$scope.themes = data;
				session.setInfo('quizzThemes', data);
			});
		}
	}

	$scope.first = true;

	$scope.chrono = function() {
		var beginTime = $scope.debut;
		if($scope.chronoStop) {
			console.log("chrono finis")
		} else {
			var curTime = Date.now();
			var timeSpend = curTime - beginTime;
			var secondes = timeSpend/1000;
			var minutes = secondes/60;
			var trueSecondes = Math.round(secondes%60);
			var heures = Math.round(minutes/60);
			var trueMinutes = Math.round(minutes%60);
			$scope.nbH = heures;
			$scope.nbM = trueMinutes;
			$scope.nbS = trueSecondes;
			if($scope.first = false) {
				$scope.$apply();
			}
			$scope.first = false;
			setTimeout($scope.chrono, 2000);
		}
	}

	$scope.randomQuizz = function(quizz) {
		var randomizedQuizz = [];
		if(typeof $scope.nbQuestion == "undefined" || $scope.nbQuestion >30) {
			$scope.nbQuestion = 30;
		} else if($scope.nbQuestion<=0) {
			$scope.nbQuestion = 5;
		}
		var nbAffiche =0;
		switch($scope.difficulte) {
			case 'facile' :
				nbAffiche = 2;
				break;
			case 'normal' :
				nbAffiche = 3;
				break;
			case 'difficile' :
				nbAffiche = -1;
				break;
		}
		console.log("randomize: original", quizz, $scope.nbQuestion, nbAffiche)
		if(typeof quizz === "undefined") {
			var quizz={
				thème: "aléatoire",
				fournisseur: "CeriGame 3101"
			}
			for(var i=0; i<$scope.nbQuestion; i++) {
				var questions = $scope.quizzs[Math.floor(Math.random()*$scope.quizzs.length)].quizz;
				randomizedQuizz.push(questions[Math.floor(Math.random()*questions.length)]);
				if(nbAffiche!=-1) {
					var nbToHide = randomizedQuizz[i].propositions.length - nbAffiche;
					var numReponse = randomizedQuizz[i].propositions.indexOf(randomizedQuizz[i]['réponse']);
					while(nbToHide>0) {
						var numToHide = numReponse;
						while(numToHide == numReponse) {
							numToHide = Math.floor(Math.random()*randomizedQuizz[i].propositions.length);
						}
						randomizedQuizz[i].propositions.splice(numToHide, 1);
						var numReponse = randomizedQuizz[i].propositions.indexOf(randomizedQuizz[i]['réponse']);
						nbToHide--;
					}
				}
			}
			quizz.quizz = randomizedQuizz;
		} else {
			var alreadyPlaced = [];
			for(var i=0; i<$scope.nbQuestion; i++) {
				var numToPlace = Math.floor(Math.random()*quizz.quizz.length);
				while(alreadyPlaced.indexOf(numToPlace) != -1) {
					var numToPlace = Math.floor(Math.random()*quizz.quizz.length);
				}
				alreadyPlaced.push(numToPlace);
				randomizedQuizz.push(quizz.quizz[numToPlace]);
				if(nbAffiche!=-1) {
					var nbToHide = randomizedQuizz[i].propositions.length - nbAffiche;
					var numReponse = randomizedQuizz[i].propositions.indexOf(randomizedQuizz[i]['réponse'])
					while(nbToHide>0) {
						var numToHide = numReponse;
						while(numToHide == numReponse) {
							numToHide = Math.floor(Math.random()*randomizedQuizz[i].propositions.length);
						}
						randomizedQuizz[i].propositions.splice(numToHide, 1);
						var numReponse = randomizedQuizz[i].propositions.indexOf(randomizedQuizz[i]['réponse']);
						nbToHide--;
					}
				}
			}
			quizz.quizz=randomizedQuizz;
		}
		console.log("randomized: ", quizz)
		$scope.playQuizz(quizz);
	}

	$scope.playQuizz = function(quizz) {
		console.log("PlayQuizz: ", quizz, $scope.nbQuestion)
		if(typeof quizz.userDefiant !== "undefined") {
			$scope.defiCase = true;
		} else {
			$scope.defiCase = false;
		}
		$scope.searchQuizz = false;
		$scope.questionQuizz = true;
		$scope.first = true;
		$scope.nbH = 0;
		$scope.nbM = 0;
		$scope.nbS = 0;

		$scope.selectedQuizz = quizz;
		$scope.debut = Date.now();
		$scope.chrono();
		$scope.nextQuestion();
	}

	$scope.reponse = function(reponse) {
		if(reponse == $scope.question.réponse) {
			$scope.nbBonneReponse = $scope.nbBonneReponse + 1;
		}
		$scope.nextQuestion();
	}

	$scope.nextQuestion = function() {
		$scope.numQuestion = $scope.numQuestion + 1;
		if($scope.numQuestion >= $scope.selectedQuizz.quizz.length || $scope.numQuestion == ($scope.nbQuestion - 1)) {
			$scope.questionQuizz = false;
			$scope.showDefier = false;
			$scope.showUserDefier = false;
			$scope.showEnd = true;
			console.log("$scope.selectedQuizz: ", $scope.selectedQuizz, "défi?: ", $scope.selectedQuizz.id_user_defiant, "type: ", typeof $scope.selectedQuizz.id_user_defiant)
			if(typeof $scope.selectedQuizz.id_user_defiant === "undefined") {
				$scope.showDefier = true;
			}
			$scope.endQuizz();
		} else {
			$scope.question = $scope.selectedQuizz.quizz[$scope.numQuestion];
			var nbAffiche =0;
			switch($scope.difficulte) {
				case 'facile' :
					nbAffiche = 2;
					break;
				case 'normal' :
					nbAffiche = 3;
					break;
				case 'difficile' :
					nbAffiche = $scope.question.propositions.length;
					break;
			}
			$scope.questionAffiche = $scope.question.propositions;
			/*if(nbAffiche == $scope.question.propositions.length) {
			} else {
				$scope.questionAffiche = [];
				var reponsePlace = false;
				console.log("builQuestion: reponse: ", $scope.question.réponse);
				for(var i=0; i<$scope.question.propositions.length; i++) {
					if($scope.question.propositions[i] == $scope.question.réponse) {
						$scope.questionAffiche.push($scope.question.propositions[i]);
						reponsePlace = true;
						nbAffiche--;
					} else if(nbAffiche > 1 && !reponsePlace) {
						$scope.questionAffiche.push($scope.question.propositions[i]);
						nbAffiche--;
					} else if(nbAffiche > 0 && reponsePlace) {
						$scope.questionAffiche.push($scope.question.propositions[i]);
						nbAffiche--;
					}
				}
			}*/
		}
	}

	$scope.recupUserDefier = function() {
		accessDataService.getInfo('/getAllUsers', function(data) {
			$scope.showUserDefier = true;
			$scope.usersDefier = data.users.rows;
			console.log("recul all users", $scope.usersDefier);	
		});
	}

	$scope.defier = function(id) {
		console.log("user to defie: ", id, "curQuizz: ", $scope.selectedQuizz);
		var curUser = session.getUser();
		accessDataService.postInfo('/defier?userId='+id + "&score=" + $scope.score, $scope.selectedQuizz, function(data) {
			if(data.error === false) {
				$rootScope.$broadcast('getMessage', {
					type: "message",
					msg: data.message
				});
				$scope.reset();
			}
		});
	}

	$scope.endQuizz = function() {
		$scope.chronoStop = true;
		console.log("fin: ", $scope.debut);
		var endTime = Date.now();
		$scope.tempS = Math.floor((endTime - $scope.debut)/1000);
		$scope.score = Math.round(($scope.nbBonneReponse*1398.2)/$scope.tempS);
		accessDataService.getInfo("/saveScore?score=" + $scope.score + "&nbReponse=" + $scope.nbBonneReponse + "&tempS=" + $scope.tempS, function(data) {
			console.log("result: ", data)
		});
	}

	$scope.reset = function() {
		$scope.quizzs = null;
		$scope.searchQuizz = true;
		$scope.questionQuizz = false;
		$scope.showEnd = false;

		$scope.defis = null;
		$scope.showDefis = false;
		$scope.usersDefiant = null;
		$scope.defiCase = false;
		$scope.showDefier = false;
		$scope.showUserDefier = false;
		$scope.usersDefier = null;

		$scope.selectedQuizz = null;
		$scope.question = null;
		$scope.questionAffiche = null;

		$scope.debut = null;
		$scope.nbBonneReponse = 0;

		$scope.nbQuestion = 5;

		$scope.score = 0;

		$scope.numQuestion = -1;

		$scope.tempS = 0;

		$scope.difficulte = "facile";
		$scope.chronoStop = false;
		$scope.nbH = 0;
		$scope.nbM = 0;
		$scope.nbS = 0;
		$scope.getThemes();
	}

	$scope.$on('showQuizz', function() {
		//Initialisation des quizzs
		console.log("click event : showQuizz");
		$scope.reset();
		/*$scope.quizzs = null;
		$scope.searchQuizz = true;
		$scope.questionQuizz = false;
		$scope.showEnd = false;


		$scope.selectedQuizz = null;
		$scope.question = null;
		$scope.questionAffiche = null;

		$scope.debut = null;
		$scope.nbBonneReponse = 0;

		$scope.nbQuestion = 5;

		$scope.score = 0;

		$scope.numQuestion = -1;

		$scope.tempS = 0;

		$scope.difficulte = "facile";
		$scope.chronoStop = false;
		$scope.nbH = 0;
		$scope.nbM = 0;
		$scope.nbS = 0;*/
	});
}

//---------Controleur view users
// Affichage des informations sur un utilisateur (si c'est l'utilisateur de la session, un formulaire de mosification des données est affiché)
function user_controller($scope, session, accessDataService, $rootScope) {
	$scope.user = null;
	$scope.bestScores = null;
	$scope.sumScore = null;

	$scope.identifiant = null;
	$scope.nom = null;
	$scope.prenom = null;
	$scope.avatar = null;

	$scope.modifResult = "";

	$scope.showModif = true;

	// récupération du score total cumulé d'un utilisateur
	$scope.getsumScore = function() {
		if (typeof $scope.user !== "undefined" && $scope.user !== null)
		{
			accessDataService.getInfo('/sumScore?idUser=' + $scope.user._id, function(data) {
				console.log("result: getBest", data)
				$scope.sumScore = data.sumScore;
			});
		}
	}

	//	Récupération des 3 meilleurs scores de l'utilisateur
	$scope.getBest = function() {
		if (typeof $scope.user !== "undefined" && $scope.user !== null)
		{
			accessDataService.getInfo('/bestScore?idUser=' + $scope.user._id, function(data) {
				console.log("result: getBest", data)
				$scope.bestScores = data.bestScores;
			});
		}
	}

	$scope.getUser = function() {
		console.log("Recup user");
		$scope.showModif = true;
		$scope.user = session.getUser();
		$scope.getsumScore();
		$scope.getBest();
	}
	// $scope.getUser();

	$scope.getOtherUser = function(id) {
		$scope.showModif = false;
		accessDataService.getInfo('/getOtherUser?userId=' + id, function(data) {
			console.log("result: RecupOtheruser :", data)
			$scope.user = data.user;
			$scope.getsumScore();
			$scope.getBest();
		});
	}

	$scope.$on('recupUser', function() {
		console.log("click event :");
		$scope.getUser();
	});

	$scope.$on('recupOtherUser', function(event, data) {
		console.log("event recupOtherUser: ", data);
		$scope.getOtherUser(data.id);
	});


	// Modification des informations de l'utilisateur, en fonction des éléments remplis et changés par rapport au informations actuelle
	// Cronstruction de l'url avec certais paramèters qui vont devoir être modifiés pour l'utilisateur connecté
	$scope.modifUser = function() {
		var CurUser = session.getUser();
		if($scope.user._id != CurUser._id) {
			console.log("Action non autorisée");
			$rootScope.$broadcast('unAutorised');
			return;
		}
		console.log("modif user")
		var url = "/updateUser?";
		var precedent = false;
		if($scope.identifiant !== null && $scope.identifiant !== "" && $scope.identifiant !== $scope.user.username) {
			if(precedent) {
				url += "&";
			}
			url+="identifiant=" + $scope.identifiant;
			precedent = true;
		}
		if($scope.nom !== null && $scope.nom !== "" && $scope.nom !== $scope.user.name) {
			if(precedent) {
				url += "&";
			}
			url+="nom=" + $scope.nom;
			precedent = true;
		}
		if($scope.prenom !== null && $scope.prenom !== "" && $scope.prenom !== $scope.user.firstName) {
			if(precedent) {
				url += "&";
			}
			url+="prenom=" + $scope.prenom;
			precedent = true;
		}
		if($scope.avatar !== null && $scope.avatar !== "" && $scope.avatar !== $scope.user.avatar) {
			if(precedent) {
				url += "&";
			}
			url+="avatar=" + $scope.avatar;
			precedent = true;
		}

		console.log("modif user, url: ", url)
		accessDataService.getInfo(url, function(data) {
			console.log("result: ", data);

			if(data.message == "modifications validées") {
				if(typeof data.userModif.username !== "undefined") {
					$scope.user.username = data.userModif.username;
				}
				if(typeof data.userModif.name !== "undefined") {
					$scope.user.name = data.userModif.name;
				}
				if(typeof data.userModif.firstName !== "undefined") {
					$scope.user.firstName = data.userModif.firstName;
				}
				if(typeof data.userModif.avatar !== "undefined") {
					$scope.user.avatar = data.userModif.avatar;
				}
				session.setUser($scope.user);
				console.log("session modifiée: ", session.getUser());
				$rootScope.$broadcast('userModified');
			}
		});
	}
}

//------------Controleur principal
function main_controller($scope, auth, session, accessDataService, $rootScope, socket) {
	$scope.user = null;
	$scope.username = null;
	$scope.password = null;

	$scope.nom = "nom";
	$scope.classBandeau = null;

	$scope.showQuizz = false;

	$scope.textBandeau = null;

	$scope.showUser = false;
	$scope.showAcceuil = false;

	/******
	**	Gestion des actions de l'utilisateur conduisat à des vues gérées par d'autres controleurs
	******/
	$scope.loadUser= function(){
		$scope.showUser = !$scope.showUser;
		$scope.showQuizz = false;
		$scope.showAcceuil = false;
		if($scope.showUser == false && $scope.showQuizz == false) {
			$scope.loadAcceuil();
		}
		console.log("emission event")
		$rootScope.$broadcast('recupUser');
	}

	$scope.loadOtherUser = function(id) {
		$scope.showUser = true;
		$scope.showQuizz = false;
		$scope.showAcceuil = false;
		console.log("emission event show otherUser")
		$rootScope.$broadcast('recupOtherUser', {
			id: id
		});
	}

	$scope.loadQuizz = function() {
		$scope.showQuizz = !$scope.showQuizz;
		$scope.showUser = false;
		$scope.showAcceuil = false;
		if($scope.showQuizz == false && $scope.showUser == false) {
			$scope.loadAcceuil();
		}
		$rootScope.$broadcast('showQuizz');
	}

	$scope.loadAcceuil = function() {
		$scope.showAcceuil = true;
		$scope.showQuizz = false;
		$scope.showUser = false;
		$rootScope.$broadcast('showAcceuil');
	}

	// Communication avec le controleur du bandeau pour lui envoyer un message à afficher
	$scope.afficheMessage = function(message) {
		$rootScope.$broadcast('getMessage', {
			type: "message",
			msg: message
		});
	}

	$scope.bandeauNom = function(nom) {
		$scope.nom = nom;
	}

	// Communication avec le controleur du bandeau pour lui envoyer une erreur à afficher
	$scope.afficheMessageError = function(message) {
		// $('#bandeau-message').removeClass("bandeau-notif").removeClass("error");
		// $scope.classBandeau = "error";

		// $scope.textBandeau = message;
		$rootScope.$broadcast('getMessage', {
			type: "error",
			msg: message
		});
	}

	$scope.affiche;
	$scope.no_logged_in = true;

	$scope.login = function() {
		//Fonction servant à la connexion d'un utilisateur
		auth.logIn($scope.username, $scope.password).then(function(data){
			// $scope.bandeauDisplay(data.statusMsg);
			console.log("result connexion:", data);
			$scope.user = data;
			if(typeof data.username == 'undefined') {
				$scope.afficheMessageError(data.statusMsg);
			} else {
				$scope.no_logged_in = false;
				// $scope.afficheMessage(data.statusMsg);
				$scope.bandeauNom(data.username);
				$scope.loadAcceuil();
			}
		});
	};

	$scope.logOut = function() {
		// Déconnexion de l'utilisateur
		console.log('logOut')
		$scope.showAcceuil = false;
		$scope.user = null;
		$scope.no_logged_in = true;
		$scope.showUser=false;
		$scope.showQuizz=false;
		return auth.logOut();
	}

	$scope.notLoggedIn = function() {
		var logged = !auth.isLoggedIn();
		return logged;
	}

	$scope.isLoggedIn = function() {
		var logged = auth.isLoggedIn();
		if (logged && $scope.user == null) {
			$scope.user = session.getUser();
		}/* else {
			accessDataService.getInfo("/userConnected", function(data) {

			});
		}*/
		return logged;
	}

	if ($scope.isLoggedIn()) {
		$scope.loadAcceuil();
		$scope.no_logged_in = false;
	}

	/**
	*	Gestion de la réception webSocket
	*/
	socket.on("notification", function(data) {
		console.log('Controleur-socket.on =>'+data);
		$scope.afficheMessage('Message du serveur ' + data);
	});

	socket.on("notification_connexion", function(data) {
		console.log('Controleur-socket.on => '+data);
		$scope.afficheMessage(data);
	});

	socket.on("notification_erreur", function(data) {
		console.log('Controleur-socket.on =>'+data);
		$scope.afficheMessageError("Message d'erreur du serveur " + data);
	});

	socket.on("reception_defi", function(data) {
		console.log('Controleur-socket.on =>', data, "user: ", $scope.user);
		if($scope.user !== null && $scope.user._id == data.id_user_defie) {
			$scope.afficheMessage(data.message);
		}
	});
	
	/**
	*	Gestion des évenements reçus par Le controleur
	*/
	$scope.$on("userModified", function() {
		$scope.user = session.getUser();
	});

	$scope.$on("unAutorised", function() {
		$scope.afficheMessageError("Action non autorisée");
	});

}

