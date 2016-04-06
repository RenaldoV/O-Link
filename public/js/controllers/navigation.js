///////////////////////////////////////////////////////
//////////////Controllers for the nav bar//////////////
///////////////////////////////////////////////////////

app.controller('navControl',function($scope, authService, session, $location, $timeout){

    // Set header message of signup $ login pages
    $timeout(function(){
        if($location.path() == "/signUp" || $location.path() == "/") {
            $scope.slog1 = "Today's Talent.";
            $scope.slog2 = "Tomorrow's Success."
        }
    },2000);

    if(authService.isAuthenticated()){
        var user = session.user;

        if(user.type == "student")
        {
            // Set header message of Dash
            $timeout(function() {
                if ($location.path() == "/dashboard") {
                    $scope.welcome = "Welcome ";
                    $scope.talent = user.name.name + "!";
                }
            },2000);

            $scope.getNav= function() {
                return "../views/blocks/studentNav.html";
            }
        }
        else if(user.type == "employer"){

            // Set header message of Dash
            $timeout(function() {
                if ($location.path() == "/dashboard") {
                    $scope.welcome = "Welcome ";
                    if (!user.company.name)
                        $scope.employer = user.contact.name + "!";
                    else
                        $scope.employer = user.company.name + "!";
                }
            },2000);

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


app.controller('studentNav',function($scope,$rootScope, $window, session, authService, $cookies, AUTH_EVENTS, $http){

    var user = session.user;
    $scope.user = user;

    $http.post('/getPp', user)
        .then(function (res) {

            $scope.image=res.data;


        });

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
    };



});

app.controller('employerNav',function($scope,$rootScope, $window, session, authService, $cookies, AUTH_EVENTS,$http){

    var user = session.user;
    $scope.user = user;

    $http.post('/getPp', user)
        .then(function (res) {

            $scope.image=res.data;


        });


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
