
function bandeau_controller($scope, session) {
	$scope.messageTab = [];
	$scope.message = {
		msg: null,
		class: null
	};
	$scope.running = false;
	$scope.secondMessage = false;

	$scope.reset = function(callback) {
		$scope.message.msg = "";
		$scope.message.class = "hide";
		if(typeof callback == "function") {
			callback();
		}
		$scope.$apply();
	}

	$scope.showMessage = function() {
		$scope.running = true;
		// 
		var message = $scope.messageTab.shift();
		// console.log("message: ", message);
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
		// $scope.messageTab.forEach(function(message) {
		// });
	});
}

//------------Controleur page d'acceuil
function accueil_controller($scope, accessDataService) {
	$scope.tot10Best = null;
	$scope.top10Sum = null;

	$scope.reloadAcceuil = function() {
		$scope.getTop10Sum();
		$scope.getTop10Best();
	}

	$scope.getTop10Best = function() {
		accessDataService.getInfo('/top10_best', function(data) {
			console.log("result: getBest", data)
			$scope.tot10Best = data.topBest;
		});
	}

	$scope.getTop10Sum = function() {
		accessDataService.getInfo('/top10_tot', function(data) {
			console.log("result: getBest", data)
			$scope.tot10Sum = data.topSum;
		});
	}

	$scope.$on('showAcceuil', function() {
		console.log("click event : acceuil");
		$scope.reloadAcceuil();
	});
}
  
//-----------Controleu quizz
function quizz_controller($scope, session, accessDataService) {
	$scope.quizzs = null;
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
	$scope.nbS = 0;

	$scope.setDifficulte = function(difficulte) {
		$scope.difficulte = difficulte;
	}

	$scope.getQuizzes = function() {
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

	/*$scope.chrono = function() {
		console.log("chrono: ")
		var beginTime = $scope.debut;
		while(!$scope.chronoStop) {
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
			sleep(1000);
		}
	}*/

	$scope.first = true;

	$scope.chrono = function() {
		console.log("chrono: ")
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

	$scope.playQuizz = function(quizz) {
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
			$scope.showEnd = true;
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
			if(nbAffiche == $scope.question.propositions.length) {
				$scope.questionAffiche = $scope.question.propositions;
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
			}
		}
	}

	$scope.endQuizz = function() {
		$scope.chronoStop = true;
		console.log("fin: ", $scope.debut);
		var endTime = Date.now();
		$scope.tempS = Math.floor((endTime - $scope.debut)/1000);
		$scope.score = Math.round(($scope.nbBonneReponse*1398.2)/$scope.tempS);
		accessDataService.getInfo('/saveScore?idQuizz=' + $scope.selectedQuizz._id + "&score=" + $scope.score + "&nbReponse=" + $scope.nbBonneReponse + "&tempS=" + $scope.tempS, function(data) {
			console.log("result: ", data)
		});
	}

	$scope.$on('showQuizz', function() {
		//Initialisation des quizzs
		console.log("click event : showQuizz");
		$scope.quizzs = null;
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
		$scope.nbS = 0;
	});
}

//---------Controlleur view users
function user_controller($scope, session, accessDataService) {
	$scope.user = null;
	$scope.bestScores = null;
	$scope.sumScore = null;

	$scope.identifiant = null;
	$scope.nom = null;
	$scope.prenom = null;
	$scope.avatar = null;

	$scope.modifResult = "";

	$scope.getUser = function() {
		console.log("Recup user");
		$scope.user = session.getUser();
	}
	$scope.getUser();

	$scope.$on('recupUser', function() {
		console.log("click event :");
		$scope.getUser();
	});

	$scope.getBest = function() {
		accessDataService.getInfo('/bestScore?idUser=' + $scope.user._id, function(data) {
			console.log("result: getBest", data)
			$scope.bestScores = data.bestScores;
		});
	}

	$scope.sumScore = function() {
		accessDataService.getInfo('/sumScore?idUser=' + $scope.user._id, function(data) {
			console.log("result: getBest", data)
			$scope.sumScore = data.sumScore;
		});
	}

	$scope.modifUser = function() {
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
			}
		});
	}

	// $('#user-show').on('click', function() {
	// 	$scope.getUser();
	// });
}

//------------Controleur principal
function main_controller($scope, auth, session, accessDataService, $rootScope) {
	$scope.user = null;
	$scope.username = null;
	$scope.password = null;

	$scope.nom = "nom";
	$scope.classBandeau = null;

	$scope.showQuizz = false;

	$scope.textBandeau = null;

	$scope.showUser = false;
	$scope.showAcceuil = false;

	$scope.loadUser= function(){
		$scope.showUser = !$scope.showUser;
		$scope.showQuizz = false;
		$scope.showAcceuil = false;
		console.log("emission event")
		$rootScope.$broadcast('recupUser');
	}

	$scope.loadQuizz = function() {
		$scope.showQuizz = !$scope.showQuizz;
		$scope.showUser = false;
		$scope.showAcceuil = false;
		$rootScope.$broadcast('showQuizz');
	}

	$scope.loadAcceuil = function() {
		$scope.showAcceuil = !$scope.showAcceuil;
		$scope.showQuizz = false;
		$scope.showUser = false;
		$rootScope.$broadcast('showAcceuil');
	}

	$scope.afficheMessage = function(message) {
		// $('#bandeau-message').removeClass("bandeau-notif").removeClass("error");
		// $scope.classBandeau = "bandeau-notif";

		// $scope.textBandeau = message;
		$rootScope.$broadcast('getMessage', {
			type: "message",
			msg: message
		});
	}

	$scope.bandeauNom = function(nom) {
		$scope.nom = nom;
	}

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
				$scope.afficheMessage(data.statusMsg);
				$scope.bandeauNom(data.username);
			}
		});
	};

	$scope.logOut = function() {
		console.log('logOut')
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
}

