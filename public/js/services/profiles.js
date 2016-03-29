/**
 * Created by Sean on 2016/02/22.
 */
app.controller('profileControl',function($scope, authService, session, $location, $http, cacheUser) {


    function getUser(){
        var temp = $location.url();

        if(temp == '/myProfile'){
            var user = session.user;
            cacheUser.create(user);
            console.log(user.type);
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
        }

        if(temp == '/editProfile'){
            var user = session.user;
            cacheUser.create(user);
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
        temp = temp.replace("/profile?user=", '');

        var credentials = {id: temp};

        $http
            .post('/loadUserById', credentials)
            .then(function (res) {

                res.data.passwordHash = null;
                var user = res.data;
                cacheUser.create(res.data);
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

app.controller('studentProfileControl', function ($scope,$http,cacheUser, session) {

    var user = cacheUser.user;

    $scope.user = user;

    $http
        .post('/getPp', user)
        .then(function (res) {

        $scope.image=res.data;


    });
    if(user._id == session.user._id){
        $("#editLink").show();
    }



});

app.controller('employerProfileControl', function ($scope,$http,cacheUser, session) {

    var user = cacheUser.user;

    $scope.user = user;

    $http
        .post('/getPp', user)
        .then(function (res) {

            $scope.image=res.data;


        });
    if(user._id == session.user._id){
        $("#editLink").show();
    }



});
app.controller('studentEditProfile', function($scope, session,Upload, $timeout, $compile, $http, $window, authService){


    $scope.user = session.user;
    var tempdob = $scope.user.dob.substring(0,9);
    //tempdob = tempdob.replace(/-/g, "/");
    $scope.user.dob = tempdob;
    var user = session.user;
    if(!user.results)
    {
        user.results = {};
    }
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
        var temp = [{}];
        $(".resBox").each(function(i){


            temp[i].name =  $(this).find('.subject').val();
            temp[i].result = $(this).find('.result').val();
        });
        $scope.user.results = temp;

        $http
            .post('/updateUser', $scope.user)
            .then(function (res, err) {



            });

        session.create(user);
        $window.location.href="/myProfile";
    };

    $('#addRes').click(function(e){

        var input = $('<div class="resBox"><input class="subject" list="requirements" placeholder="Requirement" class="form-control no-border" required>' +
            '<input class="result" list="symbols" placeholder="symbol" class="form-control no-border"  required> <button type="button" class="removeRes" class="btn btn-default">x</button></div>').insertBefore(this);


        $compile(input)($scope);
        $('.removeRes').click(function(e){

            $(this).parent().remove();
        });
    });

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

        $http
            .post('/updateUser', $scope.user)
            .then(function (res, err) {

                session.create(user);
                $window.location.href="/myProfile";

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