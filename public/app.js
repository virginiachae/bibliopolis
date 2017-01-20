console.log('linked');
var biblio = angular.module('bibliopolisApp', ['ngRoute']);

biblio.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){

$locationProvider.html5Mode(true);

$routeProvider
	.when('/', {
		templateUrl: 'templates/welcome.html.ejs'
	})
	.when('/login', {
		templateUrl: 'templates/login.html.ejs',
		controller: 'UserController'
	})
	.when('/books/new', {
		templateUrl: 'templates/new-book.html.ejs'
	})
	.when('/user-show', {
		templateUrl: "templates/user-show.html.ejs"
	})
	.when('/signup', {
		templateUrl: "templates/signup.html.ejs"
	})
	.when('/logout', {
		redirectTo: '/login'
	})
	.when('/books', {
		templateUrl: 'templates/booksIndex.html.ejs'
	})

}]);

biblio.controller('UserController', ['$scope', function($scope){

$scope.message = 'hi hi hi'

}])
