function accessDataService($http){
	/**
	* getInfo : la fonction getInfo retourne une promesse provenant du service http
	* @param url
	* @returns {*|Promise}
	*/
	this.getInfo = function(url){
		// Appel Ajax
		return $http
		.get(url)
		.then(function(response) { //First function handles success
			return(response.data);
			},
			function(response) {
				//Second function handles error
				return("Something went wrong");
		});
	}
}

// Service d'authentification
function AuthService($http) {
	this.logIn = function(login, pwd){
		return $http
			.get('/login?login=' + login + '&mdp=' + pwd)
			.then(function(response){
				console.log("response:", response.data)
				return(response.data);
				/*if(response.data.statusResp){
					console.log('Connecté => status reponse:'+response.data.statusResp+' message: '+response.data.statusMsg+' objet:'+JSON.stringify(response.data.data));
				}*/
			});
	}
}