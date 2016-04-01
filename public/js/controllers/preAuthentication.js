///////////////////////////////////////////////////////
////Controllers for everything up to authentication////
///////////////////////////////////////////////////////

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
                    else sweetAlert("Incorrect login details, or your account hasn't been activated", "Please try again.", "error");
                }
            });
    }
});


app.controller('signup', function($scope, $rootScope,$http,$window,$compile, authService, AUTH_EVENTS){

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

    var reqCount = 0;

    var btnGrp = $("#reqButtonGrp");
    var inputGrp = $("#reqInputs");

    $('#addReq').click(function(e){

        reqCount++;
        var reqSelect = $(  '<div class="reqBox'+reqCount+'">' +
            '<select class="form-control no-border" id="sel1" name="how" ng-model="user.results['+(reqCount-1)+'].name" required">' +
            '<option value="" selected disabled>Choose Subject</option>' +
            '<option value="Maths">Maths</option>' +
            '<option value="AP Maths">AP Maths</option>' +
            '<option value="English">English</option>' +
            '<option value="Science">Science</option>' +
            '<option value="Afrikaans">Afrikaans</option>' +
            '<option value="Zulu">Zulu</option>' +
            '<option value="IT">IT</option>' +
            '</select>' +
            '<select class="form-control no-border" id="sel1" name="how" ng-model="user.results['+(reqCount-1)+'].symbol" required">' +
            '<option value="" selected disabled>Choose Symbol</option>' +
            '<option value="A">A (80-100%)</option>' +
            '<option value="B">B (70-79%)</option>' +
            '<option value="C">C (60-69%)</option>' +
            '<option value="D">D (50-59%)</option>' +
            '<option value="F">F (40-49%)</option>' +
            '</select>' +
            '</div>').appendTo(inputGrp);



        if(reqCount <= 1)
        {
            var remBtn = $('<button type="button" class="removeReq btn btn-default" ng-click="close()"><span class="glyphicon glyphicon-minus"></span> Remove</button></div>').prependTo(btnGrp);
        }

        $compile(reqSelect)($scope);
        $compile(btnGrp)($scope);

    });

    $(document).on("click", ".removeReq", function(){
        if(reqCount == 1)
            $(this).remove();

        $("#reqInputs .reqBox"+reqCount+"").remove();

        reqCount--;
        $scope.user.results[reqCount] = {};
    });

    $scope.user = {};
    $scope.user.results = {};

    $scope.submitForm = function() {

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
            data 	: user,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
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