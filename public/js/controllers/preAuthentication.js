///////////////////////////////////////////////////////
////Controllers for everything up to authentication////
///////////////////////////////////////////////////////

app.controller('signin', function($scope,$rootScope, $http,authService,AUTH_EVENTS, $location){

    $(".appbg").addClass('dashBG');

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
                            $(".appbg").addClass('dashBG');
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


app.controller('signup', function($scope, $rootScope,$http,$window,$compile, authService, constants, session){
    $(".appbg").addClass('dashBG');


    $scope.reqNames = constants.requirements;
    $("#addReq").hide();
    $scope.WorkClick = function(work,num)
    {
        if(work == "company")
        {
            $("#compHired"+num+"").show();
            $("#compHired"+num+"").prop("required",true);
        }
        else
        {
            $("#compHired"+num+"").hide();
            $("#compHired"+num+"").prop("required",false);
        }

    };
    $scope.matricTypeClick = function(type) {
        $("#addReq").show();

        /*if(type == "Cambridge")
            $scope.reqNames = constants.Cambridge;
        else if(type == "NSC")
            $scope.reqNames = constants.NSC;
        else if(type == "IEB")
            $scope.reqNames = constants.IEB;*/

    };
    if($window.location.href == '/signUp'){

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

        $scope.user = {};
        $scope.user.company = {};
        $scope.user.institution = {};
        $scope.user.company.location = {};
        $scope.user.company.location.address = {};
        $scope.user.company.location.geo = {};
        $scope.user.location = {};
        $scope.user.location.address = {};
        $scope.user.location.geo = {};

    }
    else{
        $scope.user = session.user;
    }
    $scope.compCat = constants.companyCategories;
    $scope.timePeriods = constants.timePeriods;
    $scope.workNames = constants.categories;
    $scope.tertInst = constants.tertiaryInstitutions;

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
        $scope.user.location.address = data;
        geocoder.geocode({'address': data}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                $scope.user.location.geo = results[0].geometry.location;

            } else {
                console.log('Geocode was not successful for the following reason: ' + status);
            }
        });
        //alert($scope.user.address.geo);
    });

    $scope.dateOptions = {
        changeMonth: true,
        changeYear: true,
        minDate: new Date(1980, 1 - 1, 1),
        defaultDate: new Date(1990, 1 - 1, 1)
    };

    $scope.validateStuEmail = function(val)
    {
        if(val!=undefined)
        {
            var passed = false;
            var len = val.length;

            if (len > 11) {
                if (val.substr(len - 11, 11) == "@tuks.co.za") {
                    passed = true;
                }
            }
            if (len > 4) {
                if (val.substr(len - 4, 4) == ".edu") {
                    passed = true;
                }
            }
            if (len > 6) {
                if (val.substr(len - 6, 6) == ".ac.za") {
                    passed = true;
                }
            }
            if (!passed) {
                $("input[name=stuEmail]").prop('title', "If you are unable to register with your email address but you are at " +
                "an academic institution, please email info@o-link.co.za from your " +
                "academic email address and we will be sure to add it to our system " +
                "and allow you to register.");
                $("input[name=stuEmail]").tooltip();
                return passed;
            }
            else
                return passed;
        }

    };

    /*$(function () {
        $("input[name=stuEmail]").on("focusout", function () {
            var passed = false;
            $scope.studentForm.stuEmail.$setValidity("pattern", false);
            var len = $(this).val().length;

            if (len > 11) {
                if ($(this).val().substr(len - 11, 11) == "@tuks.co.za") {
                    $scope.studentForm.stuEmail.$setValidity("pattern", true);
                    passed = true;
                    alert($(this).val().substr(len - 11, 11));
                }
            }
            if (len > 4) {
                if ($(this).val().substr(len - 4, 4) == ".edu") {
                    $scope.studentForm.stuEmail.$setValidity("pattern", true);
                    passed = true;
                }
            }
            if (len > 6) {
                if ($(this).val().substr(len - 6, 6) == ".ac.za") {
                    $scope.studentForm.stuEmail.$setValidity("pattern", true);
                    passed = true;
                }
            }
            if (!passed) {
                $("input[name=stuEmail]").prop('title', "If you are unable to register with your email address but you are at " +
                "an academic institution, please email info@o-link.co.za from your " +
                "academic email address and we will be sure to add it to our system " +
                "and allow you to register.");
                $("input[name=stuEmail]").tooltip();
            }


        });
    });*/


    var numWork = 0;
    var numReq = 0;
    var workRadios = 3;
    $scope.close = function(reqs){
        numReq--;
        $scope.user.results.pop();
        if(numReq == 0)
            $scope.user.results = false;

    };
    $scope.closeWork = function(cats){
        workRadios--;
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
        workRadios++;
        $scope.typenum = workRadios;
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
    $scope.changeWork = function(workName){
        if(workName == "Other")
        {
            $("#otherCategory").prop('required',true);
            $("#otherCategory").show();
        }
        else{
            $("#otherCategory").prop('required',false);
            $("#otherCategory").hide();
        }
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

    $scope.submitForm = function(isValid) {
        $scope.submitted = true;
        if(isValid) {

            var user = $scope.user;
            if (!user.dob) {
                user.type = "employer";
            }
            else
                user.type = "student";

            user.active = false;
            $http({
                method: 'POST',
                url: '/signup',
                data: user
            })
                .then(function (res) {
                    {
                        console.log(res);
                        if (res.data == "email") {
                            swal({
                                    title: "User exists",
                                    text: 'The email you have entered already has an account associated with it.',
                                    type: "error"
                                },
                                function () {
                                    location.reload();
                                });
                        }
                        else if (res.data) {
                            swal({
                                    title: "Account created",
                                    text: 'An activation email has been sent to you. Please follow the link enclosed to activate your new profile.',
                                    type: "success"
                                },
                                function () {

                                    location.href = '/';
                                });
                        }
                    }
                });
        }
    }
});


app.controller('reset', function($scope,$rootScope, $http,authService,AUTH_EVENTS, $location,$routeParams) {
    $(".appbg").addClass('dashBG');
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
                            $(".appbg").addClass('dashBG');
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
    $(".appbg").addClass('dashBG');
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