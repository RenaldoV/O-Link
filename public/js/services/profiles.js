/**
 * Created by Sean on 2016/02/22.
 */
app.controller('profileControl',function($scope, authService, session, $location, $http, cacheUser) {


    function getUser(){
        var temp = $location.url();
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