var app = angular.module('o-link', ['ng','ngCookies','lr.upload','ngRoute','appRoutes']);

app.run(function($cookies,$rootScope, session, authService, AUTH_EVENTS){

    if ($cookies.get("user")){
        session.create(JSON.parse($cookies.get("user")));
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
    }
});

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

app.controller('signin', function($scope,$rootScope, $http,authService,AUTH_EVENTS, $location){

    if(authService.isAuthenticated())
        $location.url("/dashboard");
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

                        authService.login($scope.user).then(function (user) {

                            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                            $scope.setCurrentUser(user);
                            $location.url("/dashboard");


                        }, function () {
                            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                        });

                    }
                    else sweetAlert("Incorrect login details", "Please try again.", "error");
                }
            });
    }
});

app.controller('signup', function($scope, $rootScope,$http,$window, authService, AUTH_EVENTS){

    if(authService.isAuthenticated())
        $window.location.href= '/dashboard';

	$scope.user = {};

	$scope.submitForm = function() {

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
                        //login
                        authService.login(user.contact).then(function (user) {

                            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                            $scope.setCurrentUser(user);
                            $window.location.href= '/dashboard';


                        });
                        }
                    }
			});
	}
});

app.controller('postJob',function($scope, $http, $window, authService, session, $compile){

   if(!authService.isAuthenticated())
        $window.location.href= '/';
    if(session.user.type != 'employer')
        $window.location.href= '/';


    var times = $("#times").html();

    //add end date if short term/long term
    $("#endDateDiv").hide();

    $("#period").change(function(e){

        if(this.value == "Once Off")
        {
            $("#endDateDiv").hide();
            $("#times").html(times);

        }
        else {
            $("#endDateDiv").show();
            $("#times").html('');
        }
    });

    var reqCount = 0;
    //add requirement
    $('#addReq').click(function(e){

       var input = $('<div class="reqBox"><input list="requirements" placeholder="Requirement" class="form-control no-border" ng-model="job.post.requirements['+reqCount+'].name" required>' +
            '<input list="symbols" placeholder="symbol" class="form-control no-border" ng-model="job.post.requirements['+reqCount+'].symbol" required> <button type="button" class="removeReq" class="btn btn-default">x</button></div>').insertBefore(this);
        reqCount++;
        $compile(input)($scope);
        $('.removeReq').click(function(e){

            $(this).parent.remove();
        });
    });

    $scope.job = {};
    $scope.job.post = {};
    $scope.job.post.requirements = {};
    $scope.job.employeeEmail = session.user.contact.email;
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

app.controller('navControl',function($scope, authService, session){


    if(authService.isAuthenticated()){
        var user = session.user;
        if(user.type == "student")
        {
        $scope.getNav= function() {
            return "../views/blocks/studentNav.html";
        }}
        else if(user.type == "employer"){
            $scope.getNav= function() {
                return "../views/blocks/employerNav.html";
            }
        }
    }

$scope.$on('auth-login-success',function(){
    var user = session.user;
    if(user.type == "student")
    {
        $scope.getNav= function() {
            return "../views/blocks/studentNav.html";
        }}
    else if(user.type == "employer"){
        $scope.getNav= function() {
            return "../views/blocks/employerNav.html";
        }
    }
    } );

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


app.controller('studentNav',function($scope,$rootScope, $window, session, authService, $cookies, AUTH_EVENTS){

    $scope.user = session.user;

$scope.logOut = function() {
    swal({
            title: "Are you sure?", text: "The browser won't remember you next time you log in.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, log out!", closeOnConfirm: false
        },
        function () {
            session.destroy();

            $cookies.remove("user");
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
            $window.location.href="/";
            swal("You have been logged out.", "success");
        });
}


});

app.controller('employerNav',function($scope,$rootScope, $window, session, authService, $cookies, AUTH_EVENTS){

    $scope.user = session.user;
console.log($scope.user);
    $scope.logOut = function() {
        swal({
                title: "Are you sure?", text: "The browser won't remember you next time you log in.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, log out!", closeOnConfirm: false
            },
            function () {
                session.destroy();

                $cookies.remove("user");
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
                $window.location.href="/";
                swal("You have been logged out.", "success");
            });
    }


});


app.controller('dashControl',function($scope, authService, session){


    if(authService.isAuthenticated()){
        var user = session.user;
        if(user.type == "student")
        {
            $scope.getDash= function() {
                return "../views/blocks/studentDash.html";
            }}
        else if(user.type == "employer"){
            $scope.getDash= function() {
                return "../views/blocks/employerDash.html";
            }
        }
    }

    $scope.$on('auth-login-success',function(){
        var user = session.user;
        if(user.type == "student")
        {
            $scope.getDash= function() {
                return "../views/blocks/studentDash.html";
            }}
        else if(user.type == "employer"){
            $scope.getDash= function() {
                return "../views/blocks/employerDash.html";
            }
        }
    } );


    });

app.controller('goBrowse',function($scope, $location){



    $scope.categories = ["Coach", "Tutor", "Delivery Person", "Sales Rep", "Model", "Waiter(res)", "Other"];
    $scope.selection = [];
    $scope.toggleSelection = function(category) {
        console.log(category);
        var idx = $scope.selection.indexOf(category);

        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
        }

        // is newly selected
        else {
            $scope.selection.push(category);
        }
    };

    $scope.submit = function () {

        var temp = JSON.stringify($scope.selection)

        console.log(temp);
        temp = temp.replace(/,/g, '%');
        temp = temp.replace(/"/g, '');
        temp = temp.replace(/ /g, '_');
        temp = temp.slice(1, -1);

        console.log(temp);
       $location.path('/browseJobs').search('categories', temp);

    }

});

app.controller('jobBrowser',function($scope, $location, $http){


    var temp = $location.url();

    temp = temp.replace("/browseJobs?categories=", '');
    temp = temp.replace(/_/g, ' ');
    var arr = temp.split("%25");
    console.log(arr);

    //get the jobs
    $http({
        method  : 'POST',
        url     : '/jobBrowse',
        data : arr
    })
        .then(function(res) {
            {
                $scope.jobs = res.data;
            }
        });

});