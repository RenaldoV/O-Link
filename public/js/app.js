var app = angular.module('o-link', ['ng','ngCookies','lr.upload','ngRoute','appRoutes','ngFileUpload','ngImgCrop', 'ngDialog']);

app.run(function($cookies,$rootScope, session, authService, AUTH_EVENTS, rate){

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

                $scope.getPer = function(cat){
                if(cat == "Once Off"){
                    return cat;
                }
                    else return "hr"
            }

            }
        });
});

app.controller('reset', function($scope,$rootScope, $http,authService,AUTH_EVENTS, $location,$routeParams) {
    $scope.submitForm = function() {

        $http({
            method  : 'POST',
            url     : '/reset/'+$routeParams.token,
            data 	: $scope.user,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
            .then(function(res) {
                {
                    if(res.data != "error") {

                        alert(res.data);

                        /*           swal({   title: "Welcome",   type: "success",   timer: 800,   showConfirmButton: false });

                         authService.login($scope.user).then(function (user) {

                         $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                         $scope.setCurrentUser(user);
                         $location.url("/dashboard");


                         }, function () {
                         $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                         }); */
                        swal({
                                title: "success",
                                text: 'Your Password has been changed successfully.',
                                type: "success"
                            },
                            function(){
                                //location.reload();
                            });
                    }
                    else
                        swal({
                                title: "error",
                                text: "Password reset token is invalid or has expired. Please try again.",
                                type: "error"
                            },
                            function(){
                                //location.url("/forgot");
                            });


                }
            });
    }
});

app.controller('forgot', function($scope,$rootScope, $http,authService,AUTH_EVENTS, $location) {
		$scope.submitForm = function() {

        $http({
            method  : 'POST',
            url     : '/forgot',
            data 	: $scope.user,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
            .then(function(res) {
                {
                    if(res.data) {
              /*           swal({   title: "Welcome",   type: "success",   timer: 800,   showConfirmButton: false });

							authService.login($scope.user).then(function (user) {

                            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                            $scope.setCurrentUser(user);
                            $location.url("/dashboard");


                        }, function () {
                            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                        }); */
						swal({
							title: "success",
							text: 'An email has been sent to ' + res.data.contact.email + ' with a reset link.',
							type: "success"
						},
						function(){
							location.reload();
						});
                    }
                    else 
						swal({
							title: "error",
							text: "No account with that email address exists. Try again.",
							type: "error"
						},
						function(){
							location.reload();
						});	

					
                }
            });
    }
});


app.controller('myJobFeed', function($scope,$http, session){

    var user = session.user;

    $http({
        method  : 'POST',
        url     : '/myJobFeeder',
        data : {id: user._id}
    })
        .then(function(res) {
            {
                $scope.jobs = res.data;
                $.each($scope.jobs, function(key,value){
                    if(!value.applicants)
                    {
                        value.applicants=[];
                    }
                });
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

app.controller('postJob',function($scope, $http, $window, authService, session, $compile, $location){

   if(!authService.isAuthenticated())
        $window.location.href= '/';
    if(session.user.type != 'employer')
        $window.location.href= '/';




    //add end date if short term/long term
    $("#endDateDiv").hide();

    $("#period").change(function(e){

        if(this.value == "Once Off")
        {
            $("#endDateDiv").hide();
           var input = $('<div>Start time: <input type="time" placeholder="beginTime" class="form-control no-border" ng-model="job.post.hours.begin" required >' +
               ' Leaving time: <input type="time" placeholder="endTime" class="form-control no-border" ng-model="job.post.hours.end" required> </div>').appendTo("#times");
            $compile(input)($scope);

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
            '<input list="symbols" placeholder="symbol" class="form-control no-border" ng-model="job.post.requirements['+reqCount+'].symbol" required> <button type="button" class="removeReq" class="btn btn-default" ng-click="close()">x</button></div>').insertBefore(this);
        reqCount++;

        $compile(input)($scope);
        $('.removeReq').click(function(e){

            $(this).parent().remove();
        });
    });

    $scope.job = {};
    $scope.job.post = {};
    $scope.job.post.requirements = {};
    $scope.job.employerID = session.user._id;
    $scope.submitForm = function() {
        

          $http({
            method  : 'POST',
            url     : '/jobPoster',
            data   : $scope.job, //forms user object
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        })
            .then(function(response) {
                {
                    swal({   title: "Posted",   type: "success",   timer: 2000,   showConfirmButton: false });
                    $location.url("/dashboard");
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
    $scope.myProfile = function(){
        $window.location.href="/myProfile";
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
    $scope.myProfile = function(){
        $window.location.href="/myProfile";
    }

});


app.controller('dashControl',function($scope, authService, session, rate, $http){



    if(authService.isAuthenticated()){
        var user = session.user;
        if(user.type == "student")
        {
            $http
                .post('/loadCompletedJobs', {id: user._id})
                .then(function (res) {

                    var notifications = res.data;
                    $.each(notifications, function(key, value){
                        rate.makeEmployerBox(value);
                    });
                });
            $scope.getDash= function() {
                return "../views/blocks/studentDash.html";
            }}
        else if(user.type == "employer"){
            $http
                .post('/loadCompletedApplications', {id: user._id})
                .then(function (res) {

                    var notifications = res.data;
                    $.each(notifications, function(key, value){
                        rate.makeStudentBox(value);
                    });
                });
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


    //get the jobs
    $http({
        method  : 'POST',
        url     : '/jobBrowse',
        data : arr
    })
        .then(function(res) {
            {
                $scope.jobs = res.data;
                $scope.getPer = function(cat){
                    if(cat == "Once Off"){
                        return cat;
                    }
                    else return "hr"
                }
            }
        });

});

app.controller('jobCtrl', function($scope, $location,$http, session, notify){
    var temp = $location.url();

    var user = session.user;
    temp = temp.replace("/job?id=", '');
    id = {id: temp};
    var job = {};
    $http({
        method  : 'POST',
        url     : '/getJob',
        data : id
    })
        .then(function(res) {

                $scope.job = res.data;
                job = res.data;



        });

    $scope.apply = function() {



        if(typeof job.post.requirements == 'undefined')
            job.post.requirements = [];
        var meets = [job.post.requirements.length];
        if($.inArray(user._id, job.applicants) != -1)
        {
            sweetAlert("You have already applied for this position", "Patience is a virtue", "error");

        }
        else{
        $.each(job.post.requirements, function (key, value) {
            $.each(user.results, function (i, val) {
                if(value.name == val.name){
                    if(val.result <= value.symbol){
                        meets[key] = true;
                    }
                }
            });
        });

        if((job.post.gender == "M" || job.post.gender == "F") && job.post.gender != user.gender)
        {
            meets.push(false);
        }
        var met = true;
        $.each(meets, function(key, value){
            if(value == false)
            {
                met = false;
            }

        });

        if(!met){
            sweetAlert("Requirements not met", "", "error");

        }
        else {
            $http({
                method  : 'POST',
                url     : '/apply',
                data : {user : user, job : job }
            })
                .then(function(res) {

                    console.log(res);
                    sweetAlert("Application Successful", "", "success");
                    notify.go({
                        type: 'application',
                        jobID: job._id,
                        userID: job.employerID,
                        status: 'Made',
                        title: job.post.role
                    });

                    if(typeof job.applicants == 'undefined')
                    job.applicants = [];
                    job.applicants.push(user._id);

                });
        }
        }
    };


});

