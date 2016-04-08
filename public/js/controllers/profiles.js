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

    }

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
            $window.location.href="/myProfile";
        }, function (response) {
            if (response.status > 0) $scope.errorMsg = response.status
                + ': ' + response.data;
        }, function (evt) {
            $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
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