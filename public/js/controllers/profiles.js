/**
 * COntrollers to do with profiles.
 */
app.controller('profileControl',function($scope, authService, session, $location, $http, cacheUser, $rootScope) {



    function getUser(){
        var temp = $location.url();


        if(temp == '/myProfile'){
            var user = session.user;
            cacheUser.create(user);
            console.log(user.type);
            $rootScope.$broadcast('profile',user);
            if (user.type == "student") {
                $scope.getProfile = function () {
                    return "../views/blocks/studentProfile.html";
                };
                return;
            }
            else if (user.type == "employer") {
                $scope.getProfile = function () {
                    return "../views/blocks/employerProfile.html";
                };
                return;
            }

        }else

        if(temp == '/editProfile'){
            var user = session.user;
            cacheUser.create(user);
            $rootScope.$broadcast('profile',user);



            if (user.type == "student") {
                $scope.getProfile = function () {
                    return "../views/blocks/studentEditProfile.html";
                };
                return;
            }
            else if (user.type == "employer") {
                $scope.getProfile = function () {
                    return "../views/blocks/employerEditProfile.html";
                };
                return;
            }

        }
        else {
            temp = temp.replace("/profile?user=", '');

            var credentials = {id: temp};

            $http
                .post('/loadUserById', credentials)
                .then(function (res) {

                    res.data.passwordHash = null;
                    var user = res.data;
                    cacheUser.user = user;
                    $rootScope.$broadcast('profile',user);
                    if (user.type == "student") {
                        $scope.getProfile = function () {
                            return "../views/blocks/studentProfile.html";
                        }
                    }
                    else if (user.type == "employer") {
                        $scope.getProfile = function () {
                            return "../views/blocks/employerProfile.html";
                        }
                    }
                });

        }

    }
    if (authService.isAuthenticated()) {
        getUser();

    }else window.location = '/signIn';

    $scope.$on('auth-login-success', function () {
        getUser();

    });
});

app.controller('empProfileControl', function ($scope,cacheUser) {

    $scope.user = cacheUser.user;





});

app.controller('studentProfileControl', function ($scope,$http,cacheUser, session,photoUpload) {


    var user = cacheUser.user;
    $scope.myProfile = false;

    if (user._id == session.user._id)
        $scope.myProfile = true;

    console.log(cacheUser.user._id + " " +session.user._id);
    $scope.user = user;

    $http
        .post('/getPp', user)
        .then(function (res) {

        $scope.image=res.data;


    });


    $scope.uploadPp = function() {
        photoUpload.makeUploadBox();
    };



});

app.controller('employerProfileControl', function ($scope,$http,cacheUser, session,photoUpload) {

    var user = cacheUser.user;
    $scope.myProfile = false;
    $scope.offers = 0;
    if (user._id == session.user._id)
    $scope.myProfile = true;

    $scope.user = user;

    $http
        .post('/getOfferCount', user)
        .then(function (res) {

            
                    $scope.offers = res.data.count;

                });







    $scope.uploadPp = function() {
        photoUpload.makeUploadBox();
    };


});

app.controller('studentEditProfile', function($scope, session,Upload, $timeout, $compile, $http, $window, authService, constants){


    $scope.user = session.user;
    $scope.reqNames = constants.requirements;


    $scope.close = function(reqs){

        console.log($scope.user.results.pop());

    };
    $scope.add = function(){

        if(!$scope.user.results){
            $scope.user.results = [{}];
        }else
            console.log($scope.user.results.push({}));

    };

    var tempdob = $scope.user.dob.substring(0,9);
    //tempdob = tempdob.replace(/-/g, "/");
    $scope.user.dob = tempdob;
    var user = session.user;
    
    console.log(user);
    $scope.upload = function (dataUrl) {
        Upload.upload({
            url: '/upload',
            data: {
                file: Upload.dataUrltoBlob(dataUrl),
                user: user._id
            }
        }).then(function (response) {
            $timeout(function () {
                $scope.result = response.data;
            });
            authService.login({email: user.contact.email});
        }, function (response) {
            if (response.status > 0) $scope.errorMsg = response.status
                + ': ' + response.data;
        }, function (evt) {
            $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
        });
    };
    $scope.showUpload = function(){
        $('#ppUpload').toggle();
    };

    $scope.updateUser = function()
    {


        swal({
                title: "Are you sure?",
                type: "input",
                text: "This update your profile. Please type your password to confirm",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, I'm sure!",
                closeOnConfirm: false
            },
            function(inputValue) {

                $http
                    .post('/checkPassword', {email: user.contact.email, password: inputValue})
                    .then(function (res, err) {
                        console.log(res.data);
                        if (!res.data) {
                            console.log("awww");
                            swal.showInputError("Incorrect Password!");
                            return false;
                        }
                        else{


                            $http
                                .post('/updateUser', $scope.user)
                                .then(function (res, err) {

                                    session.create(user);
                                    swal({title: "Edited", type: "success", timer: 2000, showConfirmButton: false});
                                    $window.location.href="/myProfile";

                                });

                        }

                    });
            });






    };



    $(function(){
        $('.likeText').keyup(function(){
            $(this).width( $('#inputbox').width() + 5 );
        });
    });


});

app.controller('employerEditProfile', function($scope, session,Upload, $timeout, $compile, $http, $window, authService){


    $scope.user = session.user;

    var user = session.user;
    if(!user.results)
    {
        user.results = {};
    }
    $scope.upload = function (dataUrl) {
        Upload.upload({
            url: '/upload',
            data: {
                file: Upload.dataUrltoBlob(dataUrl),
                user: user._id
            }
        }).then(function (response) {
            $timeout(function () {
                $scope.result = response.data;
            });
            authService.login({email: user.contact.email});


        }, function (response) {
            if (response.status > 0) $scope.errorMsg = response.status
                + ': ' + response.data;
        }, function (evt) {
            $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
        });
    };
    $scope.showUpload = function(){
        $('#ppUpload').toggle();
    };

    $scope.updateUser = function()
    {


        swal({
                title: "Are you sure?",
                type: "input",
                text: "This update your profile. Please type your password to confirm",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, I'm sure!",
                closeOnConfirm: false
            },
            function(inputValue) {

                $http
                    .post('/checkPassword', {email: user.contact.email, password: inputValue})
                    .then(function (res, err) {
                        console.log(res.data);
                        if (!res.data) {
                            console.log("awww");
                            swal.showInputError("Incorrect Password!");
                            return false;
                        }
                        else{

                            $http
                                .post('/updateUser', $scope.user)
                                .then(function (res, err) {

                                    session.create(user);
                                    swal({title: "Edited", type: "success", timer: 2000, showConfirmButton: false});
                                    $window.location.href="/myProfile";

                                });

                        }

                    });
            });






    };



});

app.controller('activateProfileControl', function ($scope,$http,$location, authService, $rootScope, AUTH_EVENTS) {

    var temp = $location.url();

    temp = temp.replace("/activate?token=", '');
    var token={};token.token = temp;

    $http
        .post('/activateUser', token)
        .then(function (res, err) {

            if(!res.data){
                sweetAlert("Invalid token", "Please follow the link in the email you recieved", "error");
            }
            else {
                swal({   title: "Welcome",   type: "success",   timer: 800,   showConfirmButton: false });
                var userr = res.data;
                authService.login(userr.contact).then(function (user) {

                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                    $scope.setCurrentUser(user);
                    $location.url("/dashboard");


                }, function () {
                    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                });
            }


        });


});

app.controller('photoUploadControl', function($scope,Upload,$timeout, session, authService, $window){
    var user  = session.user;
    $scope.upload = function (dataUrl) {
        Upload.upload({
            url: '/upload',
            data: {
                file: Upload.dataUrltoBlob(dataUrl),
                user: user._id
            }
        }).then(function (response) {
            $timeout(function () {
                $scope.result = response.data;
            });
            authService.login({email: user.contact.email});
            $window.location.href="/editProfile";
        }, function (response) {
            if (response.status > 0) $scope.errorMsg = response.status
                + ': ' + response.data;
        }, function (evt) {
            $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
        });
    };
});

app.controller('editProfile', function($scope,session, photoUpload, $http, $window, constants){



    $("#addReq").hide();
    $scope.matricTypeClick = function(type) {
        $("#addReq").show();

        /*if(type == "Cambridge")
         $scope.reqNames = constants.Cambridge;
         else if(type == "NSC")
         $scope.reqNames = constants.NSC;
         else if(type == "IEB")
         $scope.reqNames = constants.IEB;*/

    };

        $scope.user = session.user;
    $scope.reqNames = constants.requirements;
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





    $scope.uploadPp = function(){
        photoUpload.makeUploadBox();
    };

    $scope.updateUser = function()
    {

var user =  $scope.user;
        console.log(user);
        swal({
                title: "Are you sure?",
                type: "input",
                text: "This update your profile. Please type your password to confirm",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, I'm sure!",
                closeOnConfirm: false
            },
            function(inputValue) {

                $http
                    .post('/checkPassword', {email: user.contact.email, password: inputValue})
                    .then(function (res, err) {
                        console.log(res.data);
                        if (!res.data) {
                            console.log("awww");
                            swal.showInputError("Incorrect Password!");
                            return false;
                        }
                        else{


                            $http
                                .post('/updateUser', $scope.user)
                                .then(function (res, err) {

                                    session.create(user);
                                    swal({title: "Edited", type: "success", timer: 2000, showConfirmButton: false});
                                    $window.location.href="/myProfile";

                                });

                        }

                    });
            });






    };
});
app.service('photoUpload', function(ngDialog) {


    this.makeUploadBox = function () {

        ngDialog.open({
                template: '../views/blocks/pictureUpload.html',
                controller: 'photoUploadControl',
                showClose: true

            }
        );


    };
});