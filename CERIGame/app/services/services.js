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
function AuthService($http, session) {
	this.logIn = function(login, pwd){
		return $http
			.get('/login?login=' + login + '&mdp=' + pwd)
			.then(function(response){
				console.log("response:", response.data);
				var data = response.data;
				if(typeof data.username !== 'undefined') {
					session.setUser({
						name: data.name,
						username: data.username,
						firstName: data.firstName
					});
					console.log("session:", session.getInfo('bib'));
					if(session.getInfo('last_connect') == null) {
						session.setInfo('last_connect', {
							last_connect: new Date()
						});
					}
				}
				return(response.data);
				/*if(response.data.statusResp){
					console.log('Connecté => status reponse:'+response.data.statusResp+' message: '+response.data.statusMsg+' objet:'+JSON.stringify(response.data.data));
				}*/
			});
	}

	this.logOut = function() {
		return $http
			.get('/logout')
			.then(function(response) {
				session.destroy();
				session.setInfo('last_connect', {
						last_connect: new Date()
					});
				return(response.data);
			});
	};

	this.isLoggedIn = function(session) {
		return session.getUser() !== null;
	}
}

function sessionService($log, $window) {
	// Instantiate data when service is loaded
	this._user = JSON.parse($window.localStorage.getItem('session.user'));
	this.getUser = function(){
		return this._user;
	};
	this.setUser = function(user){
		this._user = user;
		$window.localStorage.setItem('session.user', JSON.stringify(user));
		return this;
	};
	this.setInfo = function(key, value) {
		$window.localStorage.setItem('session.' + key, JSON.stringify(value));
	};
	this.getInfo = function(key) {
		return JSON.parse($window.localStorage.getItem('session.' + key));
	}
	this.destroy = function() {
		console.log("ici");
		$window.localStorage.clear();
	}
}