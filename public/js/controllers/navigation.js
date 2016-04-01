///////////////////////////////////////////////////////
//////////////Controllers for the nav bar//////////////
///////////////////////////////////////////////////////

app.controller('navControl',function($scope, authService, sessio, $location){


    if(authService.isAuthenticated()){
        var user = session.user;

        if(user.type == "student")
        {
            $scope.getNav= function() {
                return "../views/blocks/studentNav.html";
            }}
        else if(user.type == "employer"){



            $scope.getNav= function() {
                return "../views/blocks/employerNav.html";
            }
        }
    }
    else if($location.path() != "/" && $location.path() != "/signIn" && $location.path() != "/signUp")  {
        swal({   title: "Log in first",   type: "error",   timer: 2000,   showConfirmButton: false });
        $location.url("/signIn")
    }

    $scope.$on('auth-login-success',function(){
        var user = session.user;
        if(user.type == "student")
        {
            $scope.getNav= function() {
                return "../views/blocks/studentNav.html";
            }}
        else if(user.type == "employer"){
            $scope.getNav= function() {
                return "../views/blocks/employerNav.html";
            }
        }
    } );




});


app.controller('studentNav',function($scope,$rootScope, $window, session, authService, $cookies, AUTH_EVENTS){

    $scope.user = session.user;

    $scope.logOut = function() {
        swal({
                title: "Are you sure?", text: "The browser won't remember you next time you log in.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, log out!", closeOnConfirm: false
            },
            function () {
                session.destroy();

                $cookies.remove("user");
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
                $window.location.href="/";
                swal("You have been logged out.", "success");
            });
    };
    $scope.myProfile = function(){
        $window.location.href="/myProfile";
    }


});

app.controller('employerNav',function($scope,$rootScope, $window, session, authService, $cookies, AUTH_EVENTS){

    $scope.user = session.user;
    console.log($scope.user);
    $scope.logOut = function() {
        swal({
                title: "Are you sure?", text: "The browser won't remember you next time you log in.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, log out!", closeOnConfirm: false
            },
            function () {
                session.destroy();

                $cookies.remove("user");
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
                $window.location.href="/";
                swal("You have been logged out.", "success");
            });
    }
    $scope.myProfile = function(){
        $window.location.href="/myProfile";
    }

});
