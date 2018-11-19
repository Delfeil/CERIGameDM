var app = angular.module('main', ["ngRoute"])
	.controller('bandeau_controller', bandeau_controller)
	.controller('main_controller', main_controller) 
	.controller('quizz_controller', quizz_controller)
	.controller('user_controller', user_controller)
	.service("accessDataService", accessDataService) 
	.service('session', sessionService)
	.service('auth', AuthService)
	/* .config(function($routeProvider) {
		$routeProvider.when("/", {controller: "quizz_controller", templateUrl: "/quizz"})
			.otherwise({redirectTo: "/"});
	})*/