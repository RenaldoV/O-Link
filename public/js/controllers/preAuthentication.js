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


                            $scope.setCurrentUser(user);
                            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
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
    $scope.reqNames = constants.requirements;
    $("#addReq").hide();
    $scope.matricTypeClick = function(type) {
        $("#addReq").show();

        /*if(type == "Cambridge")
            $scope.reqNames = constants.Cambridge;
        else if(type == "NSC")
            $scope.reqNames = constants.NSC;
        else if(type == "IEB")
            $scope.reqNames = constants.IEB;*/

    }

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



    $scope.compCat = constants.companyCategories;
    $scope.timePeriods = constants.timePeriods;
    $scope.workNames = constants.categories;
    $scope.tertInst = constants.tertiaryInstitutions;
    $scope.user = {};
    $scope.user.company = {};
    $scope.user.institution = {};
    $scope.user.company.location = {};
    $scope.user.company.location.address = {};
    $scope.user.company.location.geo = {};
    $scope.user.address = {};
    $scope.user.address.address = {};
    $scope.user.address.geo = {};



    var options = {
        componentRestrictions: {country: 'za'}
    };
    var input = document.getElementById('searchTextField');
    var input1 = document.getElementById('searchTextField1');
    var autocomplete = new google.maps.places.Autocomplete(input,options);
    var autocomplete1 = new google.maps.places.Autocomplete(input1,options);
    var geocoder = new google.maps.Geocoder();

    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var data = $("#searchTextField").val();
        $scope.user.company.location.address = data;
        geocoder.geocode({'address': data}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                $scope.user.company.location.geo = results[0].geometry.location;
            } else {
                console.log('Geocode was not successful for the following reason: ' + status);
            }
        });
        //alert($scope.user.company.location.geo);
    });
    google.maps.event.addListener(autocomplete1, 'place_changed', function() {
        var data = $("#searchTextField1").val();
        $scope.user.address.address = data;
        geocoder.geocode({'address': data}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                $scope.user.address.geo = results[0].geometry.location;

            } else {
                console.log('Geocode was not successful for the following reason: ' + status);
            }
        });
        //alert($scope.user.address.geo);
    });





    var numWork = 0;
    var numReq = 0;

    $scope.close = function(reqs){
        numReq--;
        $scope.user.results.pop();
        if(numReq == 0)
            $scope.user.results = false;

    };
    $scope.closeWork = function(cats){
        numWork--;
        $scope.user.work.pop();
        if(numWork == 0)
            $scope.user.work = false;

    };
    $scope.add = function(){

        if(!$scope.user.results){
            $scope.user.results = [{}];
        }else
            $scope.user.results.push({});
            numReq++;

    };
    $scope.addWork = function(){

        if(!$scope.user.work){
            $scope.user.work = [{}];
        }else
            $scope.user.work.push({});
            numWork++;

    };

    // work experience
    var tempWorkList = [];
    for(var k = 0; k < $scope.workNames.length;k++){
        tempWorkList.push($scope.workNames[k]);
    }
    $scope.tempWork = tempWorkList;
    $scope.changeWork = function(){

        tempWorkList = [];
        for(var k = 0; k < $scope.workNames.length;k++){
            tempWorkList.push($scope.workNames[k]);
        }

        for(var i = 0; i < $scope.user.work.length; i++) {
            if ($scope.user.work[i].category) {
                tempWorkList.splice(tempWorkList.indexOf($scope.user.work[i].category), 1);
                $scope.tempWork = tempWorkList;
            }
        }
    };

    // Matric Results
    var tempReqList = [];
    for(var k = 0; k < $scope.reqNames.length;k++){
       tempReqList.push($scope.reqNames[k]);
    }
    $scope.tempReq = tempReqList;
    $scope.changeSub = function(){


        tempReqList = [];
        for(var k = 0; k < $scope.reqNames.length;k++){
            tempReqList.push($scope.reqNames[k]);
        }

        for(var i = 0; i < $scope.user.results.length; i++) {
            if ($scope.user.results[i].name) {
                tempReqList.splice(tempReqList.indexOf($scope.user.results[i].name), 1);
                $scope.tempReq = tempReqList;


            }
        }
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
    $(".appbg").addClass('signupBG');
    if(authService.isAuthenticated())
        $location.url("/dashboard");
    $scope.user = {};

    $scope.submitForm = function() {

    $http({
        method: 'POST',
        url: '/reset/' + $routeParams.token,
        data: $scope.user,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
        .then(function (res) {
            {
                if (res.data != "error") {

                    var tempUser = new Object();
                    tempUser.password = $scope.user.passwordHash;
                    tempUser.email = res.data.contact.email;

                    swal({
                            title: "Success",
                            text: 'Your password has been changed successfully.',
                            type: "success"
                        },
                        function () {
                            $(".appbg").removeClass('signupBG');
                            authService.login(tempUser).then(function (user) {
                                $scope.setCurrentUser(user);
                                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);

                                $location.url("/dashboard");


                            }, function () {
                                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                            });
                        });
                }
                else
                    swal({
                            title: "Error",
                            text: "Password reset token is invalid or has expired. Please try again.",
                            type: "error"
                        },
                        function () {
                            //location.url("/forgot");
                        });


            }
        });
    }
});

app.controller('forgot', function($scope,$rootScope, $http,authService,AUTH_EVENTS, $location) {
    $(".appbg").addClass('signupBG');
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
                                title: "Success",
                                text: 'An email has been sent to ' + res.data.contact.email + ' with a reset link.',
                                type: "success"
                            });
                    }
                    else
                        swal({
                                title: "error",
                                text: "No account with that email address exists. Try again.",
                                type: "error"
                            });


                }
            });
    }
});

app.controller('home', function($scope,$location, authService) {

    if (authService.isAuthenticated())
        $location.url("/dashboard");
    else
        window.location = "/home"
});