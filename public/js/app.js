var app = angular.module('o-link', ['lr.upload','ngRoute', 'appRoutes']);


app.controller('jobFeed', function($scope,$http){

    $http({
        method  : 'POST',
        url     : '/jobFeeder'
    })
        .then(function(res) {
            {
                $scope.jobs = res.data;
            }
        });
});



app.controller('signin', function($scope,$http){

    $scope.user = {};

    $scope.submitForm = function() {

        $http({
            method  : 'POST',
            url     : '/signin',
            data 	: $scope.user,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
            .then(function(res) {
                {
                    $scope.result = res.data;
                    //if true, then goto dashboard
                }
            });
    }
});

app.controller('signup', function($scope,$http){

	$scope.user = {};
	
	$scope.submitForm = function() {
		
		$http({
			method  : 'POST',
			url     : '/signup',
			data 	: $scope.user,
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		})
			.then(function(res) {
				{
					$scope.signUp = res.data;
				}
			});
	}
});

app.controller('postJob',function($scope, $http){

    $scope.job = {};

    $scope.submitForm = function() {
        

          $http({
            method  : 'POST',
            url     : '/jobPoster',
            data   : $scope.job, //forms user object
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        })
            .then(function(response) {
                {
                   $scope.message = response.data;
                }
            });
    };
});

