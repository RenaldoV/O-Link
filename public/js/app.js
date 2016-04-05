///////////////////////////////////////////////////////
//////////Front-end entry and dash controllers/////////
///////////////////////////////////////////////////////

var app = angular.module('o-link', ['ng','ngCookies','lr.upload','ngRoute','appRoutes','ngFileUpload','ngImgCrop', 'ngDialog']);
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
                $scope.jobs = res.data;


                $scope.getPer = function(cat){
                if(cat == "Once Off"){
                    return cat;
                }
                    else return "hr"
            }

            }
        });
    $scope.getJob = function(id){
        $window.location.href= '/job?id='+id;
    };
});

//controller for all dashboards
app.controller('dashControl',function($scope, authService, session, rate, $http, $window){



    if(authService.isAuthenticated()){
        var user = session.user;
        if(user.type == "student")
        {
            $http
                .post('/getRatingDataForStudent', {id: user._id})
                .then(function (res) {

                    var notifications = res.data;
                    $.each(notifications, function(key, value){
                        rate.makeEmployerBox(value);
                    });
                });
            $scope.getDash= function() {
                return "../views/blocks/studentDash.html";
            }}
        else if(user.type == "employer"){
            $http
                .post('/getRatingDataForEmployer', {id: user._id})
                .then(function (res) {

                    var notifications = res.data;
                    $.each(notifications, function(key, value){
                        rate.makeStudentBox(value);
                    });
                });
            $scope.getDash= function() {
                return "../views/blocks/employerDash.html";
            }
        }
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
app.controller('goBrowse',function($scope, $location, constants, $timeout){



    $scope.categories = constants.categories;
    $scope.timePeriods = constants.timePeriods;
    $scope.timePeriods
    $scope.selection = [];
    $scope.selectionP = [];

    $scope.selectAllP = function(){
        if(!$('#selectAllP').is(':checked')){
            $timeout(function () {
                $('.periods').each(function(){
                    if(!$(this).is(':checked')){
                        $(this).trigger('click');
                    }
                });
            });
        }else {
            $timeout(function () {
                $('.periods').each(function(){
                    if($(this).is(':checked')){
                        $(this).trigger('click');
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
                }
            });
        });
        }else {
            $timeout(function () {
                $('.categories').each(function(){
                    if($(this).is(':checked')){
                        $(this).trigger('click');
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

    $scope.submit = function () {

        var temp = JSON.stringify($scope.selection);
        var temp2 = JSON.stringify($scope.selectionP);


        temp = temp.replace(/,/g, '%');
        temp = temp.replace(/"/g, '');
        temp = temp.replace(/ /g, '_');
        temp = temp.slice(1, -1);

        temp2 = temp2.replace(/,/g, '%');
        temp2 = temp2.replace(/"/g, '');
        temp2 = temp2.replace(/ /g, '_');
        temp2 = temp2.slice(1, -1);


       $location.path('/browseJobs').search('categories', temp).search('timePeriods', temp2 );

    }

});

//employer dash jobs and /myJobs' controller
app.controller('myJobFeed', function($scope,$http, session, $window){

    var user = session.user;

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
app.controller('stats', function($scope,$http, session){
    var user = session.user;
    var temp = {id: user._id, type: user.type };
    $http
        .post('/getStats', temp)
        .then(function (res, err) {
            console.log(res.data);
            $scope.stats = res.data;
        });

});

