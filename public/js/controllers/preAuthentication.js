///////////////////////////////////////////////////////
////Controllers for everything up to authentication////
///////////////////////////////////////////////////////

app.controller('signin', function($scope,$rootScope, $http,authService,AUTH_EVENTS, $location){

    $(".appbg").addClass('signupBG');

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
                            $(".appbg").removeClass('signupBG');
                            $location.url("/dashboard");


                        }, function () {
                            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                        });

                    }
                    else sweetAlert("Incorrect login details, or your account hasn't been activated", "Please try again.", "error");
                }
            });
    }
});


app.controller('signup', function($scope, $rootScope,$http,$window,$compile, authService, constants){

    $(".appbg").addClass('signupBG');

    if(authService.isAuthenticated())
        $window.location.href= '/dashboard';

    $("#formTabs a").click(function(e) {
        e.preventDefault();
        $("#studentSUForm").trigger('reset');
        $("#employerSUForm").trigger('reset');

        $scope.user.dob = {};
        $scope.user.dob = undefined;
        $scope.user.type = {};
        //this.tab('show');
    });


    $scope.reqNames = constants.requirements;
    $scope.user = {};

    $scope.close = function(reqs){

        console.log($scope.user.results.pop());

    };
    $scope.add = function(){

        if(!$scope.user.results){
            $scope.user.results = [{}];
        }else
            console.log($scope.user.results.push({}));

    };



    $scope.submitForm = function() {
        $scope.submitted = true;

        var user = $scope.user;
        if(!user.dob)
        {
            user.type = "employer";
        }
        else
            user.type = "student";

        user.active = false;
        $http({
            method  : 'POST',
            url     : '/signup',
            data 	: user
        })
            .then(function(res) {
                {
                    console.log(res);
                    if(res.data == "email"){
                        swal({
                                title: "User exists",
                                text: 'The email you have entered already has an account associated with it.',
                                type: "error"
                            },
                            function(){
                                location.reload();
                            });
                    }
                    else if(res.data){
                        swal({
                                title: "Account created",
                                text: 'An activation email has been sent to you. Please follow the link enclosed to activate your new profile.',
                                type: "success"
                            },
                            function(){

                                location.href= '/';
                            });
                    }
                }
            });
    }
});


app.controller('reset', function($scope,$rootScope, $http,authService,AUTH_EVENTS, $location,$routeParams) {

    if(authService.isAuthenticated())
        $location.url("/dashboard");
    $scope.user = {};

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

                        var tempUser = new Object();
                        tempUser.password = $scope.user.passwordHash;
                        tempUser.email = res.data.contact.email;

                        swal({
                                title: "success",
                                text: 'Your password has been changed successfully.',
                                type: "success"
                            },
                            function(){
                                authService.login(tempUser).then(function (user) {

                                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                                    $scope.setCurrentUser(user);
                                    $location.url("/dashboard");


                                }, function () {
                                    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                                });
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

    if(authService.isAuthenticated())
        $location.url("/dashboard");
    $scope.user = {};

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