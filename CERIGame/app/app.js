var app = angular.module('main', []) 
	.controller('main_controller', main_controller) 
	.service("accessDataService", accessDataService) 
	.service('auth', AuthService)