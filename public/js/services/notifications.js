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
    function loadNotifications() {
        return $http
            .post('/loadNotifications', {id: session.user._id})
            .then(function (res) {
                console.log(res.data);
                $scope.notifications = res.data;

                $scope.makeSeen = function (id) {
                    $http
                        .post('/makeSeen', {id: id})
                        .then(function (res) {
                        loadNotifications();
                        });

                }
            });
    }

});

app.service('notify', function(){


    this.go = function(data){
        var notification = {};
        notification.type = data.type;
        notification.seen = false;
        switch(notification.type){
            case 'application':{
                notification.userID  = data.userID;
                notification.jobID = data.jobID;
                break;
            }
            case 'status change':{
                notification.userID  = data.userID;
                notification.jobID = data.jobID;
                break;
            }
            case 'rating':{

            }
        }
        socket.emit('notify',notification);
    };
});

