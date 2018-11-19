
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

	// Controller pour login
function main_controller($scope, auth, session, $rootScope) {
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
		}
		return logged;
	}

	if ($scope.isLoggedIn()) {
		$scope.no_logged_in = false;
	}
}

