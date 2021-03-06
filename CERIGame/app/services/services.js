function accessDataService($http){
	/**
	* getInfo : la fonction getInfo retourne une promesse provenant du service http
	* @param url
	* @returns {*|Promise}
	*/
	this.getInfo = function(url, callback){
		// Appel Ajax
		return $http
		.get(url)
		.then(function(response) { //First function handles success
				callback(response.data);
				// return(response.data);
			},
			function(response) {
				//Second function handles error
				return("Something went wrong");
		});
	}

	this.postInfo = function(url, data, callback) {
		return $http
		.post(url, data)
		.then(function(response) { //First function handles success
				callback(response.data);
				// return(response.data);
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
					console.log('set session')
					session.setUser({
						name: data.name,
						username: data.username,
						firstName: data.firstName,
						_id: data.id,
						avatar: data.avatar
					});
					session.setInfo('last_connect', {
						last_connect: new Date()
					});
				}
				return(response.data);
				/*if(response.data.statusResp){
					console.log('Connecté => status reponse:'+response.data.statusResp+' message: '+response.data.statusMsg+' objet:'+JSON.stringify(response.data.data));
				}*/
			});
	}

	this.logOut = function() {
		var last_connexion = session.getInfo('last_connect');
		var user = session.getUser();
		session.destroy();
		session.setInfo('last_connect', last_connexion);
		console.log("last_connexion: ", last_connexion.last_connect)
		return $http
			.get('/logout?last_connect=' + last_connexion.last_connect + '&user=' + user.username)
			.then(function(response) {
				return(response.data);
			});
	};

	this.isLoggedIn = function() {
		return session.getUser() !== null;
	}
}

function sessionService($log, $window, accessDataService) {
	// Instantiate data when service is loaded
	this._user = JSON.parse(window.localStorage.getItem('session.user'));
	this.getUser = function(){
		return this._user;
	};
	this.setUser = function(user){
		this._user = user;
		window.localStorage.setItem('session.user', JSON.stringify(user));
		return this;
	};
	this.setInfo = function(key, value) {
		window.localStorage.setItem('session.' + key, JSON.stringify(value));
	};
	this.getInfo = function(key) {
		return JSON.parse(window.localStorage.getItem('session.' + key));
	}
	this.destroy = function() {
		window.localStorage.clear();
	}
}

// Service webSocket
function treatSocket($rootScope) {
	var socket = io.connect('http://pedago02a.univ-avignon.fr:3101/');
	return {
		on: function(eventName, callback){
			socket.on(eventName, callback);
		},
		emit: function(eventName, data) {
			socket.emit(eventName, data);
		}
	};
}