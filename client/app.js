'use strict';

var app = angular.module('presentations', ['ngRoute', 'satellizer', 'mm.foundation', 'mm.foundation.topbar']);

app.config(function($authProvider) {
  $authProvider.oauth2({
    url: '/auth/hackerschool',
    name: 'hackerschool',
    clientId: '6c63e56e006d2c972350b10425953ddb575f140d0130cf5de9cdf1abf3960c47',
    authorizationEndpoint: 'https://www.hackerschool.com/oauth/authorize',
    redirectUri: "http://127.0.0.1:8000"
  });
});

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '/partials/presentation.html',
      controller: 'PresentationController'
    })
    .when('/login', {
      controller: 'LoginController'
    })
    .when('/logout', {
      resolve: {
        logout: ['$location', '$auth', function($location, $auth) {
          $auth.logout();
          return $location.path('/');
        }]
      }
    })
    .otherwise({
      redirectTo: '/'
    });
}]);


app.controller("AuthController", function($scope, $auth, $location) {
  $scope.isAuthenticated = $auth.isAuthenticated;
});

app.controller("PresentationController", function($scope, $auth, $location, $http) {
  $scope.isAuthenticated = $auth.isAuthenticated;

  $http.get('/api/list')
    .success(function(data, status, headers, config) {
      $scope.list = data;
    });

  $http.get('/api/user/me')
    .success(function(data, status, headers, config) {
      $scope.currentUser = data;
    });

  $scope.duration = 5;

  $scope.addPresentation = function(){
    var presentation = {
      'duration': parseInt($scope.duration, 10)
    };

    $http.post('/api/add', presentation)
      .success(function(data, status, headers, config) {
        if (!data.error) {
          $http.get('/api/list')
            .success(function(data, status, headers, config) {
              $scope.list = data;
              $scope.alreadyPresenting = presenting();
            });
        }
      });
  };

  $scope.cancelPresentation = function() {
    $http.post('/api/cancel')
      .success(function(data, status, headers, config){
        if (!data.error) {
          $http.get('/api/list')
            .success(function(data, status, headers, config) {
              $scope.list = data;
              $scope.alreadyPresenting = presenting();
            });
        }
      });
  };

  function presenting() {
    $http.get('/api/presenting')
      .success(function(data, status, headers, config){
        $scope.alreadyPresenting = data.presenting;
      });
  }
  $scope.alreadyPresenting = presenting();
});


app.controller("LoginController", function($scope, $auth, $location) {

  $scope.isAuthenticated = $auth.isAuthenticated();

  $scope.$watch('isAuthenticated', function(isAuthenticated) {
    if (isAuthenticated){
      $location.path('/');
    }
  });

  $scope.authenticate = function(provider) {
    $auth.authenticate(provider).then(function(argument) {
      $scope.isAuthenticated = true;
    });
  };

});
