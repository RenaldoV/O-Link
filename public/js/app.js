///////////////////////////////////////////////////////
//////////Front-end entry and dash controllers/////////
///////////////////////////////////////////////////////

var app = angular.module('o-link', ['ng','ngCookies','lr.upload','ngRoute','appRoutes','ngFileUpload','ngImgCrop', 'ngDialog','infinite-scroll','toggle-switch','ui.date','ui.validate','google.places','ui.bootstrap', 'rzModule', 'angularjs-dropdown-multiselect']);
//Starts when the app starts
app.run(function($cookies,$rootScope, session, authService, AUTH_EVENTS, rate){

    if ($cookies.get("user")){
        session.create(JSON.parse($cookies.get("user")));
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
    }




});

//feed on student dashboard
app.controller('jobFeed', function($scope,$http, $window){

    $http({
        method  : 'POST',
        url     : '/jobFeeder'
    })
        .then(function(res) {
            {

                var jobs = res.data;
                console.log(jobs);
                console.log(jobs.length);
                var len = jobs.length;
                $.each(jobs,function(i,job){


                    $http
                        .post('/getPp', {profilePicture:job.employerID.profilePicture})
                        .then(function (res) {

                            job.image = res.data;


                        });
                });
                $scope.jobs = jobs;


                $scope.getPer = function(cat){
                if(cat == "Once Off"){
                    return cat;
                }
                    else return "hr"
            }

            }
        });

    $scope.getPp = function(pp){

    };
    $scope.getJob = function(id){
        $window.location.href= '/job?id='+id;
    };
});

//controller for all dashboards
app.controller('dashControl',function($scope, authService, session, rate, $http, $window){

    function employerBoxes(arr, i){

            rate.makeEmployerBox(arr[i], function(res){
                if(i < arr.length -1)
                {
                    employerBoxes(arr, ++i);
                }
            });

    }
    function studentBoxes(arr, i){

        rate.makeStudentBox(arr[i], function(res){
            if(i < arr.length -1)
            {
                studentBoxes(arr, ++i);
            }
        });

    }


    $(".appbg").removeClass('signupBG');

    if(authService.isAuthenticated()){
        var user = session.user;
        if(user.type == "student")
        {
            $http
                .post('/getRatingDataForStudent', {id: user._id})
                .then(function (res) {

                    var notifications = res.data;
                    if(notifications.length>0)
                   employerBoxes(notifications,0);
                });
            $scope.getDash= function() {
                return "../views/blocks/studentDash.html";
            }}
        else if(user.type == "employer"){
            $http
                .post('/getRatingDataForEmployer', {id: user._id})
                .then(function (res) {

                    var notifications = res.data;
                    if(notifications.length>0)
                    studentBoxes(notifications,0);
                });
            $scope.getDash= function() {
                return "../views/blocks/employerDash.html";
            }
        }
    }
    else
    {
        $scope.getDash= function() {
            return "../views/blocks/guestDash.html";
        };
    }

    $scope.$on('auth-login-success',function(){
        var user = session.user;
        if(user.type == "student")
        {
            $scope.getDash= function() {
                return "../views/blocks/studentDash.html";
            }}
        else if(user.type == "employer"){
            $scope.getDash= function() {
                return "../views/blocks/employerDash.html";
            }
        }
    } );


    });

//dashboard selection box for browsing jobs
app.controller('goBrowse',function($scope, $location, constants, $timeout, $window){



    $scope.categories = constants.categories;
    $scope.timePeriods = constants.timePeriods;
        $scope.selectionC = [];
    $scope.selectionP = [];

    $scope.allCat = "Select All";
    $scope.allPer = "Select All";

    $scope.selectAllP = function(){
        if(!$('#selectAllP').is(':checked')){
            $timeout(function () {
                $('.periods').each(function(){
                    if(!$(this).is(':checked')){
                        $(this).trigger('click');
                        $scope.allPer = "Unselect All";
                    }
                });
            });
        }else {
            $timeout(function () {
                $('.periods').each(function(){
                    if($(this).is(':checked')){
                        $(this).trigger('click');
                        $scope.allPer = "Select All";
                    }
                });
            });
        }

    };
    $scope.selectAllC = function(){

        if(!$('#selectAllC').is(':checked')){
        $timeout(function () {
            $('.categories').each(function(){
                if(!$(this).is(':checked')){
                    $(this).trigger('click');
                    $scope.allCat = "Unselect All";
                }
            });
        });
        }else {
            $timeout(function () {
                $('.categories').each(function(){
                    if($(this).is(':checked')){
                        $(this).trigger('click');
                        $scope.allCat = "Select All";
                    }
                });
            });
        }

    };

    $scope.toggleSelectionP = function(category) {

        var idx = $scope.selectionP.indexOf(category);

        // is currently selected
        if (idx > -1) {
            $scope.selectionP.splice(idx, 1);
        }

        // is newly selected
        else {
            $scope.selectionP.push(category);
        }
    };
    $scope.toggleSelectionC = function(category) {

        var idx = $scope.selectionC.indexOf(category);

        // is currently selected
        if (idx > -1) {
            $scope.selectionC.splice(idx, 1);
        }

        // is newly selected
        else {
            $scope.selectionC.push(category);
        }
    };

    $scope.submit = function () {
        if($location.url() == '/guest'){
            window.location = '/signIn';
        }

        var dat = {};
        dat.timePeriods = $scope.selectionP;
        dat.categories = $scope.selectionC;
        var parm = $.param(dat);
        $window.location.href= '/browseJobs?'+ parm;

        var temp = JSON.stringify($scope.selectionC);
        var temp2 = JSON.stringify($scope.selectionP);


    }

});

//employer dash jobs and /myJobs' controller
app.controller('myJobFeed', function($scope,$http, session, $window, $location, $rootScope){

    var user = session.user;

    if($location.path() == "/myJobPosts"){
        $rootScope.$broadcast('myJobs',user);
    }
    $http({
        method  : 'POST',
        url     : '/myJobFeeder',
        data : {id: user._id}
    })
        .then(function(res) {
            {
                $scope.jobs = res.data;
                $.each($scope.jobs, function(key,value){
                    if(!value.applicants)
                    {
                        value.applicants=[];
                    }
                });
            }
        });
    $scope.getJob = function(id){
        $window.location.href= '/job?id='+id;
    };
});

//controller for boxes on dash
app.controller('stats', function($scope,$http, session, $location){
    if($location.path() == "/guest")
    {
        var user = {id:'guest', type:'guest'}
    }
    else{
    var user = session.user;
    }
    var temp = {id: user._id, type: user.type };
    $http
        .post('/getStats', temp)
        .then(function (res, err) {
            console.log(res.data);
            $scope.stats = res.data;
        });

});

