/**
 * Created by Sean on 2016/02/29.
 */


app.controller('studentApplications', function ($scope,$http,cacheUser, session, notify, $compile, $window) {

    var user = cacheUser.user;
    console.log(user);
    $scope.user = user;

    if(user == session.user) {
        $scope.getApps = function(){
            return "../views/blocks/studentApplication.html";
        };

        $http
            .post('/loadApplications', user)
            .then(function (res) {

                $scope.applications = res.data;

                $scope.changeStatus = function(app, oldstat) {

                    changeStatus(app,oldstat, $scope, $http,notify,app.employerID);
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

                $scope.accept = function(id, employerID, jobID, role){
                    swal({
                            title: "Are you sure?",
                            text: "This will notify the user and that you hve accepted",
                            showCancelButton: true,
                            confirmButtonColor: "#DD6B55",
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
                                            title: role
                                        });
                                        swal("Offer accepted.", "The user has been notified.", "success");


                                    });
                            }
                        });

                };

                $scope.decline = function(id, employerID, jobID, role){
                    swal({
                            title: "Are you sure?",
                            text: "This will notify the user and that you hve declined",
                            showCancelButton: true,
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Yes, I'm sure!",
                            closeOnConfirm: false
                        },
                        function (isConfirm) {

                            if (isConfirm) {
                                $http
                                    .post('/declineOffer', {_id: id})
                                    .then(function (res, err) {
                                        notify.go({
                                            type: 'declined',
                                            jobID: jobID,
                                            userID: employerID,
                                            status: 'declined',
                                            title: role
                                        });
                                        swal("Offer declined.", "The user has been notified.", "success");


                                    });
                            }
                        });

                };


                if($scope.applications.length == 0)
                {
                    $scope.message = "You haven't applied for any jobs.";
                }


            });
    }
    else if(session.user.type == 'employer'){
        $scope.getApps = function(){
            return "../views/blocks/employerApplication.html";
        };
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

    $scope.offer = function(id, studentID, jobID, role){
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
                                title: role
                            });
                            swal("Offer made.", "The user has been notified.", "success");


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

app.controller('jobHistory', function ($scope,$http,cacheUser, session) {

    var user = cacheUser.user;
    if(!user){
        user = session.user;
    }
    $scope.user = user;



    $http
        .post('/loadJobHistory', {studentID : user._id})
        .then(function (res) {

            $scope.applications = res.data;
            console.log($scope.applications);
            if($scope.applications.length == 0)
            {
                $scope.message = "You haven't completed any jobs.";
            }



        });

});

app.controller('employerApplicants', function ($scope,$http,cacheUser, session, $location, notify) {

    var user = session.user;
    $scope.user = user;

    var temp = $location.url();

    if(temp == '/applicants') {
        $http
            .post('/loadApplicants', user)
            .then(function (res) {

                $scope.applications = res.data;

                $scope.getAge = function (dob) {
                    return getAge(dob);
                };

                $scope.isDisabled = function(status){
                    if(status != "Declined"){
                        return false;
                    }
                    return true;
                };

                $scope.changeStatus = function (app, oldstat) {

                    changeStatus(app, oldstat, $scope, $http, notify, app.studentID._id);
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
    }
    else {
        temp = temp.replace("/applicants?jobID=", '');
        $http
            .post('/loadApplicantsByJobId', {_id:temp})
            .then(function (res) {

                $scope.applications = res.data;

                $scope.getAge = function (dob) {
                    return getAge(dob);
                };
                console.log($scope.applications);


                $scope.changeStatus = function (app, oldstat) {

                    changeStatus(app, oldstat, $scope, $http,notify, app.studentID);
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
    }
    $scope.offer = function(id, studentID, jobID, role){
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
                                title: role
                            });
                            swal("Offer made.", "The user has been notified.", "success");


                        });
                }
            });

    }
});





function changeStatus(app,oldstat, $scope, $http, notify, userID) {
    var check = false;
    console.log(app);
    swal({
            title: "Are you sure?",
            text: "This will change the status of this application from " + oldstat + " to " + app.status,
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, I'm sure!",
            closeOnConfirm: false
        },
        function (isConfirm) {

            if (isConfirm) {
                $http
                    .post('/updateApplication', {_id: app._id, status: app.status})
                    .then(function (res, err) {

                        console.log(res);


                        notify.go({
                            type: 'status change',
                            jobID: app.jobID._id,
                            userID: userID,
                            status: app.status,
                            title: app.jobID.post.role
                        });
                        swal("Status updated.", "The user has been notified.", "success");


                    });

            }
            else {
                for (var i = 0; i < $scope.applications.length; i++) {
                    if ($scope.applications[i]._id == app._id) {

                        $scope.applications[i].status = oldstat;
                        $scope.$apply();
                        console.log($scope.applications[i]);
                    }
                }

            }
        }
    );
}