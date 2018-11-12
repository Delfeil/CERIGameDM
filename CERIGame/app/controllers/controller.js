
function bandeau_controller($scope, session) {
}
 
function quizz_controller($scope, accessDataService) {
	$scope.quizzs = null;
	$scope.getQuizzes = function() {
		accessDataService.getInfo('/quizzList', function(data) {
			console.log("result: ", data)
			$scope.quizzs = data;
		});
	}

}

	// Controller pour login
function main_controller($scope, auth, session) {
	$scope.user = null;
	$scope.username = null;
	$scope.password = null;

	$scope.nom = "nom";
	$scope.classBandeau = null;

	$scope.showQuizz = false;

	$scope.textBandeau = null;

	$scope.loadQuizz = function() {
		$scope.showQuizz = !$scope.showQuizz;
	}

	$scope.afficheMessage = function(message) {
		//$('#bandeau-message').text(message);
		$scope.classBandeau = "bandeau-notif";

		$scope.textBandeau = message;
	}

	$scope.bandeauNom = function(nom) {
		$scope.nom = nom;
	}

	$scope.afficheMessageError = function(message) {
		//$('#message-connect').text(message);
		$scope.classBandeau = "error";

		$scope.textBandeau = message;
	}

	$scope.affiche
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
		return auth.logOut();
	}

	$scope.notLoggedIn = function() {
		var logged = !auth.isLoggedIn();
		console.warn("notLogIn: ", logged);
		return logged;
	}	

	$scope.isLoggedIn = function() {
		var logged = auth.isLoggedIn();
		console.warn("logIn: ", logged);
		if (logged && $scope.user == null) {
			$scope.user = session.getUser();
		}
		return logged;
	}

	if ($scope.isLoggedIn()) {
		$scope.no_logged_in = false;
	}
}