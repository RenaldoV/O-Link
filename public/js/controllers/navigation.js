///////////////////////////////////////////////////////
//////////////Controllers for the nav bar//////////////
///////////////////////////////////////////////////////
app.controller('logoClick', function($scope,$window){
    $scope.toDash= function(){
        $window.location.href="/dashboard";
    };
});
app.controller('navControl',function($scope, authService, session, $location, $window, $timeout,$rootScope, cacheUser,$http){

$scope.browse = false;

// Set header message of signup $ login pages


        if($location.path() == "/signUp" || $location.path() == "/" || $location.path() == "/signIn") {
            $scope.welcoming = false;
            $scope.slogan = true;
            $scope.slog = true;
            $scope.slog1 = "Today's Talent.";
            $scope.slog2 = "Tomorrow's Success."
        }




    //for guests
    if($location.path() == "/guest")
    {
        var user = {id:'guest', type:'guest'};
        $scope.loggedIn = true;
        $http.post('/getPp', user)
            .then(function (res) {

                $scope.image = res.data;


            });

    }else{
        var user = session.user;
    }


function headings(){
    var user = session.user;
    $scope.loggedIn = true;
    $rootScope.$on('profile', function (re,data) {
        $scope.welcoming = false;
        $scope.slogan = false;
        $scope.welcome = '';
        $scope.talent = '';
        $scope.browse = false;

        $timeout(function () {
            $scope.cache = data;
            if (cacheUser.user.type == 'student') {
                $scope.studentProfile = true;

            } else if (cacheUser.user.type == 'employer') {
                if (cacheUser.user.employerType == 'Individual')
                    $scope.individualProfile = true;
                else if (cacheUser.user.employerType == 'Company')
                    $scope.companyProfile = true;

            }
        });
    });
    $rootScope.$on('browse', function () {

        $scope.welcoming = false;
        $scope.slogan = false;
        $scope.studentProfile = false;
        $scope.individualProfile = false;
        $scope.companyProfile = false;
        $scope.browse = true;

    });
    $rootScope.$on('job', function () {

        $scope.welcome = '';
        $scope.talent = '';
        $scope.browse = false;
        $scope.studentProfile = false;
        $scope.individualProfile = false;
        $scope.companyProfile = false;
        $timeout(function () {
            $scope.cache = cacheUser.user;
            if (cacheUser.user.type == 'student') {
                $scope.studentProfile = true;
            }
            else if (cacheUser.user.type == 'employer') {
                if (cacheUser.user.employerType == 'Individual')
                    $scope.individualProfile = true;
                else if (cacheUser.user.employerType == 'Company')
                    $scope.companyProfile = true;

            }
        });
    });




    $http.post('/getPp', user)
        .then(function (res) {

            $scope.image = res.data;


        });

    $scope.myProfile = function () {
        $window.location.href = "/myProfile";
    };
    if (user.type == "student") {
        // Set header message of Dash
        console.log($location.path());
        $scope.slog1 = "";
        $scope.slog2 = "";
        $timeout(function () {
            $scope.welcoming = true;
            if ($location.path() == "/dashboard") {
                $scope.welcome = "Welcome ";
                $scope.talent = user.name.name + "!";
            }
        });
        $scope.getNav = function () {

            return "../views/blocks/studentNav.html";
        }
    }
    else if (user.type == "employer") {
        // Set header message of Dash
        $scope.slog1 = "";
        $scope.slog2 = "";
        $timeout(function () {
            if ($location.path() == "/dashboard") {
                $scope.welcoming = true;
                $scope.welcome = "Welcome ";
                if (!user.company)
                    $scope.employer = user.contact.name + "!";
                else
                    $scope.employer = user.company.name + "!";

            }
        });
        $scope.getNav = function () {
            return "../views/blocks/employerNav.html";
        }
    }
}


        if (authService.isAuthenticated()) {
            headings();
        }
        else if ($location.path() != "/" && $location.path() != "/signIn" && $location.path() != "/signUp" && $location.path() != "/activate" && $location.path().indexOf("/reset/") != 0&& $location.path() != "/guest" ) {
            //swal({title: "Log in first", type: "error", timer: 2000, showConfirmButton: false});
            $location.url("/signIn");

        }

    $scope.$on('auth-login-success',function(){
        
        $timeout(function() {
       headings();
        },200);
    } );





});


app.controller('studentNav',function($scope,$rootScope, $window, session, authService, $cookies, AUTH_EVENTS, $http, $location, $timeout){

    var user = session.user;
    $scope.user = user;

    if ($location.path() == "/dashboard") {
        $timeout(function() {
            $scope.welcome = "Welcome ";
            $scope.talent = user.name.name + "!";
        });
    }

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
