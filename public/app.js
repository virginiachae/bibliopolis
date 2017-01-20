console.log('linked');
var biblio = angular.module('bibliopolisApp', ['ngRoute']);

biblio.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true);

    $routeProvider
        .when('/', {
            templateUrl: 'templates/welcome.html.ejs'
        })
        .when('/login', {
            templateUrl: 'templates/login.html.ejs',
        })
        .when('/books/new', {
            templateUrl: 'templates/new-book.html.ejs'
        })
        .when('/user-show', {
            templateUrl: "templates/user-show.html.ejs",
            controller: 'UserController'
        })
        .when('/signup', {
            templateUrl: "templates/signup.html.ejs"
        })
        .when('/logout', {
            redirectTo: '/login'
        })
        .when('/books', {
            templateUrl: 'templates/booksIndex.html.ejs',
            controller: 'BooksIndexController'
        })

}]);

biblio.controller('BooksIndexController', ['$scope', '$http', function($scope, $http) {
    $http({
        method: 'GET',
        url: '/api/books'
    }).then(function successCb(res) {
        console.log(res);
        $scope.books = res.data
    }, function errorCb(res) {
        console.log('there was an error getting book data', res);
    });
}]);

biblio.controller('UserController', ['$scope', '$http', function($scope, $http) {
    $http({
        method: 'GET',
        url: '/api/users'
    }).then(function successCb(res) {
        console.log(res);
    }, function errorCb(res) {
        console.log('there was an error getting book data', res);
    });

}])
