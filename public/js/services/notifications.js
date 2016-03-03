/**
 * Created by Sean on 2016/03/02.
 */
var socket = io();

app.controller('notifications', function($scope,$http, session, $route){

    $scope.notifications = {};
    console.log(session.user._id);


    loadNotifications();

    socket.on('notified'+ session.user._id, function(data){
       loadNotifications();
    });


    $scope.makeSeen = function (id) {
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


    this.makeBox = function(data){
        $http
            .post('/getPp', data.studentID)
            .then(function (res) {

                data.image=res.data;
                ngDialog.open({template: '../views/blocks/rate.html',
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
    $scope.confirm = function(){
        console.log($scope.rating);

        $http
            .post('/updateApplication', {_id: app._id, status: app.status, rating: $scope.rating})
            .then(function (res, err) {

                console.log(res);


                notify.go({
                    type: 'rated',
                    jobID: app.jobID._id,
                    userID: app.studentID._id,
                    status: "rated "+$scope.rating+ " stars",
                    title: app.jobID.post.role
                });
                swal("User Rater.", "The user has been notified.", "success");


            });

    }



});
