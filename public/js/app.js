var app = angular.module('o-link', ['ngRoute', 'appRoutes', 'MainCtrl', 'NerdCtrl','NerdService', 'GeekCtrl', 'GeekService']);


app.controller('jobFeed', function($scope){

    $scope.pile = function () {
        return [
            'yo',
            'Grunt',
            'Bower'
        ];
    }
    console.log("dash");
});

app.controller('postJob',function($scope, $http){

    $scope.job = {};

    $scope.submitForm = function() {
        

          $http({
            method  : 'POST',
            url     : '/postJob',
            body   : $scope.job, //forms user object
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        })
            .success(function(data) {
                {
                    $scope.message = data;
                }
            });
    };
});
