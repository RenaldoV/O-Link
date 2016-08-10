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
                text: "This updates your profile. Please type your password to confirm.",
                showCancelButton: true,
                confirmButtonColor: "#7266ba",
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
                text: "This updates your profile. Please type your password to confirm.",
                showCancelButton: true,
                confirmButtonColor: "#7266ba",
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

app.controller('signUpPhotoUploadControl', function($scope,Upload,$timeout, $rootScope){

    $scope.upload = function (dataUrl) {
        Upload.upload({
            url: '/upload',
            data: {
                file: Upload.dataUrltoBlob(dataUrl)
            }
        }).then(function (response) {
            $timeout(function () {
                $scope.result = response.data;
                $rootScope.$broadcast('signUpPP', response.data);
                $scope.closeThisDialog();
            });

        }, function (response) {
            if (response.status > 0) $scope.errorMsg = response.status
                + ': ' + response.data;
        }, function (evt) {
            $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
        });
    };
});

app.controller('editProfile', function($scope,session, photoUpload, $http, $window, constants, $location, Upload){

    $scope.user = session.user;
    $scope.reqNames = constants.requirements;
    $scope.compCat = constants.companyCategories;
    $scope.timePeriods = constants.timePeriods;
    $scope.workNames = constants.categories;
    $scope.tertInst = constants.tertiaryInstitutions;
    $scope.reqNames = constants.requirements;



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

    if($scope.user.work)
        var numWork = $scope.user.work.length;

    if($scope.user.results)
        var numReq = $scope.user.results.length;

    if($scope.user.certifications)
        var numCert = $scope.user.certifications.length;

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



    $scope.upload = function (file, to) {
        console.log(file);
        Upload.upload({
            url: '/uploadFile',
            data: {file: file}
        }).then(function (resp) {
            console.log('Success ' + resp.config.data.file.name);
            if(to == 'matric'){
                $scope.user.matricFile = resp.data;
            }
            else{
                $scope.user.certifications[to].file = resp.data;
            }
            to =  resp.data;
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
    };
    $scope.uploadPp = function(){
        photoUpload.makeUploadBox();
    };

    $scope.submitForm = function() {
        $scope.submitted = true;
        if ($scope.studentForm.$valid || $scope.employerForm.$valid){
            var user = $scope.user;
        console.log(user);
        swal({
                title: "Are you sure?",
                type: "input",
                text: "This updates your profile. Please type your password to confirm.",
                showCancelButton: true,
                confirmButtonColor: "#7266ba",
                confirmButtonText: "Yes, I'm sure!",
                closeOnConfirm: false
            },
            function (inputValue) {

                $http
                    .post('/checkPassword', {email: user.contact.email, password: inputValue})
                    .then(function (res, err) {
                        console.log(res.data);
                        if (!res.data) {
                            console.log("awww");
                            swal.showInputError("Incorrect Password!");
                            return false;
                        }
                        else {


                            $http
                                .post('/updateUser', $scope.user)
                                .then(function (res, err) {

                                    session.create(user);
                                    swal({title: "Edited", type: "success", timer: 2000, showConfirmButton: false});
                                    $window.location.href = "/myProfile";

                                });

                        }

                    });
            });
    }






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
app.service('signUpPhotoUpload', function(ngDialog) {


    this.makeUploadBox = function () {

        ngDialog.open({
                template: '../views/blocks/pictureUpload.html',
                controller: 'signUpPhotoUploadControl',
                showClose: true

            }
        );


    };
});


app.controller('buy', function($scope, constants, session, $location, $rootScope){
    var user = session.user;
    var pre = '';
    if(user.type == 'student'){
    $scope.packages = constants.studentPackages;
    $rootScope.$broadcast('buyApplications',1);
        pre = 'Talent'
    }
    else if(user.type == 'employer'){
        $scope.packages = constants.employerPackages;
        $rootScope.$broadcast('empBuy',1);
        pre = "Employer"
    }

    $scope.goPay = function(name){
        $location.path('/confirmPayment').search({package:pre+"_"+name});
    }
});