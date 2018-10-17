
function bandeau_controller($scope, session) {
	/*$scope.show = function() {

	}*/
	$scope.afficheMessage = function(message) {
		console.log("là:", message);
	}
}

	// Controller pour login
function main_controller($scope, auth) {
	$scope.username = null;
	$scope.password = null;

	$scope.afficheMessage = function(message) {
		$('#bandeau-message').text(message);
	}

	$scope.bandeauNom = function(nom) {
		$('#bandeau-nom').text(nom);
	}

	$scope.afficheMessageError = function(message) {
		$('#message-connect').text(message);
	}

	$scope.affiche

	$scope.login = function() {
		//Fonction servant à la connexion d'un utilisateur
		auth.logIn($scope.username, $scope.password).then(function(data){
			// $scope.bandeauDisplay(data.statusMsg);
			console.log("result connexion:", data);
			if(typeof data.username == 'undefined') {
				$scope.afficheMessageError(data.statusMsg);
			} else {
				$scope.afficheMessage(data.statusMsg);
				$scope.bandeauNom(data.username);
			}
		});
	};

	$scope.logOut = function() {
		auth.logOut();
	}

	$scope.isLoggedIn = function() {
		return auth.isLoggedIn();
	}
}