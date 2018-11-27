
function bandeau_controller($scope, session) {
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
			setTimeout($scope.chrono, 1000);
		}
	}

	$scope.playQuizz = function(quizz) {
		$scope.searchQuizz = false;
		$scope.questionQuizz = true;
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
	$scope.getUser = function() {

		console.log("Recup user");
		$scope.user = session.getUser();
	}
	$scope.getUser();

	$scope.$on('recupUser', function() {
		console.log("click event :");
		$scope.getUser();
	});

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

	$scope.loadUser= function(){
		$scope.showUser = !$scope.showUser;
		console.log("emission event")
		$rootScope.$broadcast('recupUser');
	}

	$scope.loadQuizz = function() {
		$scope.showQuizz = !$scope.showQuizz;
		$rootScope.$broadcast('showQuizz');
	}

	$scope.afficheMessage = function(message) {
		$('#bandeau-message').removeClass("bandeau-notif").removeClass("error");
		$scope.classBandeau = "bandeau-notif";

		$scope.textBandeau = message;
	}

	$scope.bandeauNom = function(nom) {
		$scope.nom = nom;
	}

	$scope.afficheMessageError = function(message) {
		$('#bandeau-message').removeClass("bandeau-notif").removeClass("error");
		$scope.classBandeau = "error";

		$scope.textBandeau = message;
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
		$scope.no_logged_in = false;
	}
}

