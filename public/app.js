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
        .when('/profile', {
            templateUrl: "templates/user-show.html.ejs",
            controller: 'UserShowController'
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
				.when('/users', {
            templateUrl: 'templates/UsersIndex.html.ejs',
            controller: 'UsersIndexController'
        })
        .when('/children/new', {
            templateUrl: 'templates/new-child.html.ejs',
        })
}]);

biblio.controller('BooksIndexController', ['$scope', '$http', function($scope, $http) {
    $http({
        method: 'GET',
        url: '/api/books'
    }).then(function successCb(res) {
        $scope.books = res.data
    }, function errorCb(res) {
        console.log('there was an error getting book data', res);
    });
}]);

biblio.controller('UsersIndexController', ['$scope', '$http', function($scope, $http) {
    $http({
        method: 'GET',
        url: '/api/users'
    }).then(function successCb(res) {
				$scope.users = res.data
    }, function errorCb(res) {
        console.log('there was an error getting book data', res);
    });

}])

biblio.controller('UserShowController', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
		$http({
        method: 'GET',
        url: '/api/current-user'
    }).then(function successCb(res) {
				$scope.user = res.data;
    }, function errorCb(res) {
        console.log('there was an error getting book data', res);
    });

    $http({
        method: 'GET',
        url: '/api/children'
    }).then(function successCb(res) {
				$scope.children = res.data;
    }, function errorCb(res) {
        console.log('there was an error getting book data', res);
    });

    $scope.editUser = function (user) {
    $http({
      method: 'PUT',
      url: '/api/users',
      data: user
    }).then(function successCallback(json) {
      // don't need to do anything!
    }, function errorCallback(res) {
      console.log('There was an error editing the data in angular', res);
    });
  }

  $scope.editBook = function (book) {
  $http({
    method: 'PUT',
    url: '/api/books',
    data: book
  }).then(function successCallback(json) {
    // don't need to do anything!
  }, function errorCallback(res) {
    console.log('There was an error editing the data in angular', res);
  });
}

$scope.deleteBook = function (book) {
    $http({
      method: 'DELETE',
      url: '/api/books/'+ book._id,
    }).then(function successCallback(json) {
      var index = $scope.user.books.indexOf(book);
      $scope.user.books.splice(index,1)
    }, function errorCallback(response) {
      console.log('There was an error deleting the data', response);
    });
  }

  $scope.borrowBook = function (book) {
  $http({
    method: 'PATCH',
    url: '/api/books',
    data: book
  }).then(function successCallback(json) {
    var index = $scope.user.books.indexOf(book);
    $scope.user.books[index]= json.data.savedBook;
  }, function errorCallback(res) {
    console.log('There was an error editing the data in angular', res);
  });
}

$scope.returnBook = function (book) {
$http({
  method: 'PUT',
  url: '/api/children',
  data: book
}).then(function successCallback(json) {
  var index = $scope.user.books.indexOf(book);
  $scope.user.books[index].child = null;
}, function errorCallback(res) {
  console.log('There was an error editing the data in angular', res);
});
}


}])
