/**
 * Created by Sean on 2016/03/02.
 */
var socket = io();

app.controller('notifications', function($scope,$http, session, cacheUser){

    $scope.notifications = {};
    $scope.userType = session.user.type;


    loadNotifications();

    socket.on('notified'+ session.user._id, function(data){
       loadNotifications();
    });


    $scope.makeSeen = function (id) {
        cacheUser.user = session.user;
        $http
            .post('/makeSeen', {id: id})
            .then(function (res) {
                loadNotifications();

            });

    };

    function loadNotifications() {
        return $http
            .post('/loadNotifications', {id: session.user._id})
            .then(function (res) {
                console.log(res.data);
                $scope.notifications = res.data;
                $scope.message = "<b>hi</b>";


            });
    }

});

app.service('notify', function(){


    this.go = function(data){
        var notification = data;
        notification.seen = false;

        socket.emit('notify',notification);
    };
});

app.service('rate', function(ngDialog, $controller, $http){


    this.makeStudentBox = function(data){
        $http
            .post('/getPp', data.studentID)
            .then(function (res) {

                data.image=res.data;
                ngDialog.open({template: '../views/blocks/rateStudent.html',
                    controller: 'rateBox',
                    data : data,showClose: false,
                        closeByDocument : false

                    }
                );

            });

    }

    this.makeEmployerBox = function(data){
        $http
            .post('/getPp', data.employertID)
            .then(function (res) {

                data.image=res.data;
                ngDialog.open({template: '../views/blocks/rateEmployer.html',
                        controller: 'rateBox',
                        data : data,showClose: false,
                        closeByDocument : false

                    }
                );

            });

    }
});

app.controller('rateBox', function($scope, $http, notify){
    console.log($scope.ngDialogData);
var app = $scope.ngDialogData;

    $scope.confirmStudent = function(){
        console.log($scope.rating);

        $http
            .post('/updateApplication', {_id: app._id, status: app.status, studentRating: $scope.rating, commentToStudent: $scope.comment})
            .then(function (res, err) {

                console.log(res);


                notify.go({
                    type: 'rated',
                    jobID: app.jobID._id,
                    userID: app.studentID._id,
                    status: "rated "+$scope.rating+ " stars",
                    title: app.jobID.post.role,
                    comment: $scope.comment
                });
                swal("User Rated.", "The user has been notified.", "success");


            });

    };

    $scope.confirmEmployer = function(){
        console.log($scope.rating);

        $http
            .post('/updateApplication', {_id: app._id, status: app.status, employerRating: $scope.rating, commentToEmployer: $scope.comment})
            .then(function (res, err) {

                console.log(res);


                notify.go({
                    type: 'rated',
                    jobID: app.jobID._id,
                    userID: app.employerID._id,
                    status: "rated "+$scope.rating+ " stars",
                    title: app.jobID.post.role,
                    comment: $scope.comment
                });
                swal("User Rated.", "The user has been notified.", "success");


            });

    };



});
