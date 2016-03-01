/**
 * Created by Sean on 2016/02/29.
 */


app.controller('studentApplications', function ($scope,$http,cacheUser, session) {

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
                console.log($scope.applications);


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

                $scope.changeStatus = function(app, oldstat) {

                    changeStatus(app,oldstat, $scope, $http);
                };

            });
    }
    else{

        $scope.message = "You are not allowed to view other students' applications.";
    }


});


app.controller('employerApplicants', function ($scope,$http,cacheUser, session, $location) {

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
                console.log($scope.applications);


                $scope.changeStatus = function (app, oldstat) {

                    changeStatus(app, oldstat, $scope, $http);
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

                    changeStatus(app, oldstat, $scope, $http);
                };

            });
    }
});





function changeStatus(app,oldstat, $scope, $http) {
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