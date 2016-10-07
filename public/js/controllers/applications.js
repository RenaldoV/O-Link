/**
 * Created by Sean on 2016/02/29.
 */


app.controller('studentApplications', function ($scope,$http,cacheUser, session, notify,$rootScope, $window,$timeout) {

    $scope.highlightChildren = function(event){
        angular.element(event.currentTarget).children().addClass("hover");
    };
    $scope.unhighlightChildren = function(event){
        angular.element(event.currentTarget).children().removeClass("hover");
    };

    var user = cacheUser.user;
    $scope.user = user;
    $scope.getJob = function(id){
        $window.location.href= '/job?id='+id;
    };
    if(user == session.user) {
        $scope.getApps = function(){
            return "../views/blocks/studentApplication.html";
        };

        $http
            .post('/loadApplications', user)
            .then(function (res) {

                $scope.applications = res.data;
                //console.log($scope.applications[0].employerID);
                $.each($scope.applications,function(i,app){
                    app.jobID.post.startingDate = convertDateForDisplay(app.jobID.post.startingDate);
                     $http
                     .post('/getPp', {profilePicture:app.employerID.profilePicture})
                     .then(function (res) {

                         app.image = res.data;
                     });
                 });

                $rootScope.$broadcast('myApplications', 1);



                $scope.isDeclined = function(status){
                    if(status == "Declined"){
                        return true;
                    }
                    return false;
                };
                $scope.isProv = function(status){
                    if(status == "Provisionally accepted"){
                        return true;
                    }
                    return false;
                };
                $scope.isPending = function(status){
                    if(status == "Pending"){
                        return true;
                    }
                    return false;
                };
                $scope.isConfirmed = function(status){
                    if(status == "Confirmed"){
                        return true;
                    }
                    return false;
                };

                $scope.accept = function(id, employerID, jobID, job){
                    swal({
                            title: "Are you sure?",
                            text: "This will notify the user and that you have accepted",
                            showCancelButton: true,
                            confirmButtonColor: "#00b488",
                            confirmButtonText: "Yes, I'm sure!",
                            closeOnConfirm: false
                        },
                        function (isConfirm) {

                            if (isConfirm) {
                                $http
                                    .post('/acceptOffer', {_id: id})
                                    .then(function (res, err) {
                                        notify.go({
                                            type: 'accepted',
                                            jobID: jobID,
                                            userID: employerID,
                                            status: 'accepted',
                                            title: job.post.category
                                        });
                                        swal("Offer accepted.", "The user has been notified.", "success");

                                    });
                                if(--job.positionsLeft == 0) {
                                    //Decline all other applicants not Confirmed
                                    //get all applicants not confirmed or already declined
                                    //console.log("declining all other applicants");
                                    $http
                                        .post('/getAllApplicantsOfJob', {jobID: job._id})
                                        .then(function (res, er) {
                                            var apps = res.data;
                                            $.each(apps, function (i, app) {
                                                declineAll(app._id, $http, notify, app.studentID, job);
                                            });
                                            $timeout(function(){
                                                location.reload();
                                            },1000);

                                        });

                                }else
                                    location.reload();
                            }
                        });

                };

                $scope.decline = function(id, employerID, jobID, job){
                    swal({
                            title: "Are you sure?",
                            text: "This will notify the user and that you have withdrawn",
                            showCancelButton: true,
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Yes, I'm sure!",
                            closeOnConfirm: false
                        },
                        function (isConfirm) {

                            if (isConfirm) {
                                $http
                                    .post('/declineOffer', {_id: id,job:job})
                                    .then(function (res, err) {
                                        notify.go({
                                            type: 'withdrawn',
                                            jobID: jobID,
                                            userID: employerID,
                                            status: 'withdrawn',
                                            title: job.post.category
                                        });
                                        swal("Offer declined.", "The user has been notified.", "success");
                                        location.reload();

                                    });
                            }
                        });

                };


                $scope.acceptChanges = function(id){
                    $http
                        .post('/acceptChanges', {id: id})
                        .then(function (res, err) {

                            swal("Changes accepted.", "The employer has been notified.", "success");
                            location.reload();

                        });
                };
                if($scope.applications.length == 0)
                {
                    $scope.message = "You haven't applied for any jobs.";
                }


            });
    }
    else if(session.user.type == 'employer'){

        $http
            .post('/loadApplicationsTo', session.user)
            .then(function (res) {

              if(res.data.length == 0)
                    $scope.message = "Has yet to apply to any of your job posts.";

                $scope.applications = res.data;
                $scope.isDisabled = function(status){
                    if(status != "Declined"){
                        return false;
                    }
                    return true;
                };



                $scope.changeStatus = function(app, oldstat) {

                    changeStatus(app,oldstat, $scope, $http, notify, app.studentID._id);
                };

            });
    }
    else{

        $scope.message = "You are not allowed to view other students' applications.";
    }

    $scope.offer = function(id, studentID, jobID, category){
        swal({
                title: "Are you sure?",
                text: "This will notify the user and he will accept or decline",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, I'm sure!",
                closeOnConfirm: false
            },
            function (isConfirm) {

                if (isConfirm) {
                    $http
                        .post('/makeOffer', {_id: id})
                        .then(function (res, err) {
                            notify.go({
                                type: 'offer',
                                jobID: jobID,
                                userID: studentID,
                                status: 'offered',
                                title: category
                            });
                            swal("Offer made.", "The user has been notified.", "success");
                            location.reload();

                        });
                }
            });

    }


});

app.controller('myApplications', function ($scope,$http,cacheUser, session) {

    var user = session.user;
    cacheUser.user = user;
    $scope.user = user;

        $scope.getApps = function () {
            return "../views/blocks/studentApplication.html";
        };
        $http
            .post('/loadApplications', user)
            .then(function (res) {

                $scope.applications = res.data;
                if($scope.applications.length == 0)
                {
                    $scope.message = "You haven't applied for any jobs.";
                }



            });

});



app.controller('employerApplicants', function ($scope,$http,cacheUser, session, $location, notify, $rootScope,$window) {

    $scope.highlightChildren = function(event){
        angular.element(event.currentTarget).children().addClass("hover");
    };
    $scope.unhighlightChildren = function(event){
        angular.element(event.currentTarget).children().removeClass("hover");
    };
    var user = session.user;
    $scope.user = user;

    var temp = $location.url();

    $rootScope.$broadcast('myApplicants', 1);


        $http
            .post('/loadApplicants', user)
            .then(function (res) {

                $scope.applications = {};

                $scope.jobs = res.data;
                $scope.hasApps = false;
                //console.log($scope.jobs);
                $.each($scope.jobs,function(i,job){
                    job.post.startingDate = convertDateForDisplay(job.post.startingDate);
                    $.each(job.applications,function(i,app){
                        $scope.hasApps = true;
                        console.log(app);
                        $http
                            .post('/getPp', {profilePicture:app.studentID.profilePicture})
                            .then(function (res) {

                                app.image = res.data;
                            });
                    });
                });

                if(!$scope.hasApps){
                    $scope.message = "There are no applicants to display.";
                }
                $scope.toggleApplicants = function(id){
                    $.each($scope.jobs, function(idx,job){
                       if(job._id == id){
                           if(job.show == undefined){
                                   job.show = true;
                           }
                           else job.show = !job.show;
                       }
                        else{
                           job.show = true;
                       }
                    });
                };
                temp = temp.replace("/applicants?jobID=", '');
                if(temp != ''){
                    $scope.toggleApplicants(temp);
                }
                $scope.getAge = function (d) {
                    var today = new Date();
                    var todayYear = today.getFullYear();
                    var todayMonth = today.getMonth();
                    var todayDate = today.getDate();
                    var dob = new Date(d);
                    var dobYear = dob.getFullYear();
                    var dobMonth = dob.getMonth();
                    var dobDate = dob.getDate();
                    var yearsDiff = todayYear - dobYear ;
                    var age;
                    if ( todayMonth < dobMonth )
                    {
                        age = yearsDiff - 1;
                    }
                    else if ( todayMonth > dobMonth )
                    {
                        age = yearsDiff ;
                    }
                    else //if today month = dob month
                    { if ( todayDate < dobDate )
                    {
                        age = yearsDiff - 1;
                    }
                    else
                    {
                        age = yearsDiff;
                    }
                    }
                    return age;
                };

                $scope.isDisabled = function(status){
                    if(status != "Declined"){
                        return false;
                    }
                    return true;
                };
                $scope.getApplicant = function(id) {
                    $window.location.href= '/profile?user='+id;
                };

                $scope.isDeclined = function(status){
                    if(status == "Declined"){
                        return true;
                    }
                    return false;
                };
                $scope.isProv = function(status){
                    if(status == "Provisionally accepted"){
                        return true;
                    }
                    return false;
                };
                $scope.isPending = function(status){
                    if(status == "Pending"){
                        return true;
                    }
                    return false;
                };
                $scope.isConfirmed = function(status){
                    if(status == "Confirmed"){
                        return true;
                    }
                    return false;
                };

            });


    $scope.decline = function(ap, job){
        var app = jQuery.extend(true, {}, ap);
        app.status = "Declined";
        $scope.col = '#DD6B55';
        changeStatus(app, 'Pending', $scope,$http,notify,app.studentID._id,job);
    };
    $scope.makeOffer = function(ap, job){
        var app = jQuery.extend(true, {}, ap);
        app.status = "Provisionally accepted";
        $scope.col = '#00b488';
        changeStatus(app,  'Pending', $scope, $http,notify, app.studentID._id,job);
    };
    $scope.offer = function(id, studentID, jobID, category){
        swal({
                title: "Are you sure?",
                text: "This will notify the user and he will accept or decline",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, I'm sure!",
                closeOnConfirm: false
            },
            function (isConfirm) {

                if (isConfirm) {
                    $http
                        .post('/makeOffer', {_id: id})
                        .then(function (res, err) {
                            notify.go({
                                type: 'offer',
                                jobID: jobID,
                                userID: studentID,
                                status: 'offered',
                                title: category
                            });
                            swal("Offer made.", "The user has been notified.", "success");
                            location.reload();

                        });
                }
            });

    }
});



function declineAll(appID, $http, notify, studentID, job){
    $http
        .post('/updateApplication', {_id: appID, status: "Declined", jobID: job._id})
        .then(function (err, res) {

            notify.go({
                type: 'status change',
                jobID: job._id,
                userID: studentID,
                status: "Declined",
                title: job.post.category
            });


        });
}

function changeStatus(app,oldstat, $scope, $http, notify, userID, job) {
    var check = false;
    if($scope.col){
        var col = $scope.col;
    }
    else var col = "#00b488";

    if(app.status == "Provisionally accepted" && job.provisionalLeft == 0){
        swal("Can't accept more Students", "You can't make more offers than positions available.", "error");
        $scope.disableMakeOffer = true;
    }else {
        swal({
                title: "Are you sure?",
                text: "This will change the status of this application from " + oldstat + " to " + app.status,
                showCancelButton: true,
                confirmButtonColor: col,
                confirmButtonText: "Yes, I'm sure!",
                closeOnConfirm: true
            },
            function (isConfirm) {

                delete $scope.col;
                if (isConfirm) {
                    $http
                        .post('/updateApplication', {_id: app._id, status: app.status, jobID: job._id})
                        .then(function (err, res) {

                            notify.go({
                                type: 'status change',
                                jobID: app.jobID._id,
                                userID: userID,
                                status: app.status,
                                title: job.post.category
                            });
                            swal("Status updated.", "The user has been notified.", "success");
                            location.reload();

                        });

                }

            }
        );
    }
}