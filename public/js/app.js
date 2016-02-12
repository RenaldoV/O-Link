var app = angular.module('o-link', ['ng','ngCookies','lr.upload','ngRoute','appRoutes']);

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


app.service('User',function($cookies){
    var user = null;
    return {

        exists: function(){
          if($cookies.get("user"))
          return true;
            else return false;
        },
        get: function () {
            return $cookies.get("user");
        },
        set: function (u) {
            $cookies.put("user", u);;
        },
        destroy: function(){
            $cookies.remove("user");
        }
    }

});
app.controller('signin', function($scope,$http, $location,User, $cookies){


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
                             console.log(User.get());
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
        console.log("yolo");
		var user = $scope.user;
		$http({
			method  : 'POST',
			url     : '/signup',
			data 	: user,
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		})
			.then(function(res) {
				{
                    console.log(res);
					if(res.data == "email"){
                        swal("User exists", "The email you have entered already has an account associated with it.", "error");
                    }
                    else if(res.data == true){
                        swal({   title: "Welcome",   type: "success",   timer: 2000,   showConfirmButton: false });
                        User.set(user);
                        console.log(User.get());
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

app.controller('navControl',function($scope, User){



    if(User.get()) {
        //var user = User.get();

        //if(user.type == "student"){

        $scope.getNav= function() {
            return "../views/blocks/studentNav.html";
        }
        }
        //else{
          //  $scope.getNav= function() {
            //    return "../views/blocks/employeeNav.html";
            //}
        //}



    //}
   /*else if($location.path() != "/" && $location.path() != "/signIn" && $location.path() != "/signUp")  {
        swal({   title: "Log in first",   type: "error",   timer: 2000,   showConfirmButton: false });
        $location.url("/signIn")
    }*/

});


app.controller('studentNav',function($scope,$location, User, $timeout){

$scope.logOut = function() {
    swal({
            title: "Are you sure?", text: "The browser won't remember you next time you log in.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, log out!", closeOnConfirm: false
        },
        function () {
            User.destroy();
            swal("You have been logged out.", "success");
            timeout(400);
            $location.url("/signIn");
        });
}


});