/**
 * Created by Sean on 2016/02/22.
 */
app.controller('profileControl',function($scope, authService, session, $location, $http, cacheUser) {


    function getUser(){
        var temp = $location.url();
        if(temp == '/myProfile'){
            var user = session.user;
            cacheUser.create(user);
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
        }
        temp = temp.replace("/user?id=", '');

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

    console.log("yey");
    console.log(cacheUser.user);
    $scope.user = cacheUser.user;


});

app.controller('studentProfileControl', function ($scope,cacheUser) {


    $scope.user = cacheUser.user;




});
app.controller('userProfile', function($scope, session,Upload, $timeout){

    $scope.user = session.user;

    $scope.upload = function (dataUrl) {
        Upload.upload({
            url: '/upload',
            data: {
                file: Upload.dataUrltoBlob(dataUrl)
            }
        }).then(function (response) {
            $timeout(function () {
                $scope.result = response.data;
            });
        }, function (response) {
            if (response.status > 0) $scope.errorMsg = response.status
                + ': ' + response.data;
        }, function (evt) {
            $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
        });
    }
});


