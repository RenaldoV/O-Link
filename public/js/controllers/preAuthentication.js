///////////////////////////////////////////////////////
////Controllers for everything up to authentication////
///////////////////////////////////////////////////////

app.controller('signin', function($scope,$rootScope, $http,authService,AUTH_EVENTS, $location){

    $(".appbg").addClass('dashBG');

    if(authService.isAuthenticated())
        $location.url("/dashboard");
    $scope.user = {};

    $scope.submitForm = function() {
        if($scope.form.$valid) {
            $http({
                method: 'POST',
                url: '/signin',
                data: $scope.user,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })
                .then(function (res) {
                    {

                        if (res.data) {

                            swal({title: "Welcome", type: "success", timer: 800, showConfirmButton: false});

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
    }
});


app.controller('signup', function($scope, $rootScope,$http,$window,$location,$compile, authService, constants, session){
    $(".appbg").addClass('dashBG');

    $("#formTabs a").click(function(e) {
        e.preventDefault();
        $("#studentSUForm").trigger('reset');
        $("#employerSUForm").trigger('reset');
        $scope.studentForm.$valid = false;
        $scope.employerForm.$valid = false;
        $scope.user = {};
        $scope.user.company = {};
        $scope.user.institution = {};
        $scope.user.company.location = {};
        $scope.user.company.location.address = {};
        $scope.user.company.location.geo = {};
        $scope.user.location = {};
        $scope.user.location.address = {};
        $scope.user.location.geo = {};
        $scope.user.dob = {};
        $scope.user.dob = undefined;
        if($(this).text() == "Talent")
            $scope.user.type = "student";
        else if($(this).text() == "Employer")
            $scope.user.type = "employer";
    });

    $scope.reqNames = constants.requirements;


    if($location== '/signUp'){

        if(authService.isAuthenticated())
            $window.location.href= '/dashboard';

    }
    else{
        $scope.user = session.user;
    }
    $scope.compCat = constants.companyCategories;
    $scope.timePeriods = constants.timePeriods;
    $scope.workNames = constants.categories;
    $scope.tertInst = constants.tertiaryInstitutions;


    $scope.autocompleteOptions = {
        componentRestrictions: { country: 'za' }
    };
    var geocoder = new google.maps.Geocoder();
    $scope.$on('g-places-autocomplete:select', function (event, param) {
        if($scope.user.type == "student") {
            $scope.user.location.address = param.formatted_address;
            geocoder.geocode({'address': $scope.user.location.address}, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    $scope.user.location.geo.lat = results[0].geometry.location.lat();
                    $scope.user.location.geo.lng = results[0].geometry.location.lng();
                } else {
                    console.log('Geocode was not successful for the following reason: ' + status);
                }
            });
        }
        else if($scope.user.type == "employer")
        {
            $scope.user.company.location.address = param.formatted_address;
            geocoder.geocode({'address': $scope.user.company.location.address}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    $scope.user.company.location.geo.lat = results[0].geometry.location.lat();
                    $scope.user.company.location.geo.lng = results[0].geometry.location.lng();

                } else {
                    console.log('Geocode was not successful for the following reason: ' + status);
                }
            });
        }
    }); // Save location and geometry

    $scope.idfill = true;
    var idfill;
    $scope.dateOptions = {
        changeMonth: true,
        changeYear: true,
        minDate: new Date(1980, 1 - 1, 1),
        defaultDate: new Date(1990, 1 - 1, 1),
        onSelect: function(dob){
            $scope.user.dob = dob;
            $scope.idfill = false;
            idfill = dob.substring(8,10) + dob.substring(0,2) + dob.substring(3,5);
            $scope.user.IDnumber = idfill;
        }
    }; // Autofill ID first 6 charaters

    $scope.validateStuEmail = function(val) {
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

    $scope.validateStuID = function(val){
      if(val != undefined && idfill != undefined){
          if(val.substring(0,6) != idfill){
              return false;
          }
          else {
              return true;
          }
      }
    };

    $scope.validatestuPassw = function(pass){
        if(pass != undefined && $scope.user.passwordHash != undefined){
            return pass == $scope.user.passwordHash
        }
    };

    $scope.validateempPassw = function(pass){
        if(pass != undefined && $scope.user.passwordHash != undefined){
            return pass == $scope.user.passwordHash
        }
    };


    var numWork = 0;
    var numReq = 0;
    var numCert = 0;
    var workRadios = 3;
    $scope.close = function(reqs){
        numReq--;
        $scope.user.results.pop();
        if(numReq == 0)
            $scope.user.results = false;

    };
    $scope.closeCert = function(certs){
        numCert--;
        $scope.user.certifications.pop();
        if(numCert == 0)
            $scope.user.certifications = false;

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
    $scope.addCert = function(){

        if(!$scope.user.certifications){
            $scope.user.certifications = [{}];
        }else {
            $scope.user.certifications.push({});
        }
            numCert++;

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

        if($scope.studentForm.$valid || $scope.employerForm.$valid) {

            var user = $scope.user;

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