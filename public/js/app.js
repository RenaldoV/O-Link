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


app.factory('User',function($http, $q, $rootScope){
    var user = null;
    return {

        exists: function(){
          if(user == null)
          return false;
            else return true;
        },
        get: function () {
            return user;
        },
        set: function (u) {
            user = u;
        }
    }

});
app.controller('signin', function($scope,$http, $location,User){


    if(User.exists())
    $location.url('/dashboard');

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

                    if(res.data) {
                        swal({   title: "Welcome",   type: "success",   timer: 800,   showConfirmButton: false });
                        $http({
                            method  : 'POST',
                            url     : '/loadUser',
                            data 	: $scope.user,
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        }).then(function(result){
                            User.set(result.data);
                            $location.url('/dashboard');
                        });



                    }
                    else sweetAlert("Incorrect login details", "Please try again.", "error");
                }
            });
    }
});

app.controller('signup', function($scope,$http,$location, User){

    if(User.exists())
        $location.url('/dashboard');

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
					if(res == "email"){
                        swal("User exists", "The email you have entered already has an account associated with it.", "error");
                    }
                    else if(res == true){
                        swal({   title: "Welcome",   type: "success",   timer: 2000,   showConfirmButton: false });
                        User.set($scope.user);
                        $location.url('/dashboard');
                    }
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

app.controller('navControl',function($scope, $http,$location,User){



    if(User.exists()) {

        $scope.getNav= function(){
            return "../views/blocks/studentNav.html";
        }


    }
   else if($location.path() != "/" && $location.path() != "/signIn" && $location.path() != "/signUp")  {
        swal({   title: "Log in first",   type: "error",   timer: 2000,   showConfirmButton: false });
        $location.url("/signIn")
    }

});



function post(path, params, method) {
    method = method || "post"; // Set method to post by default if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
}