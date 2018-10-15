function main_controller($scope, auth, accessDataService) {
	$scope.username = null;
	$scope.password = null;

	$scope.login = function() {
		alert('ici')
		//Fonction servant à la connexion d'un utilisateur
		auth.logIn($scope.username, $scope.password).then(function(data){
			// $scope.bandeauDisplay(data.statusMsg);
			console.log("result connexion:", data);
		});
	};
}