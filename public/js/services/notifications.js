/**
 * Created by Sean on 2016/03/02.
 */
var socket = io();

app.controller('notifications', function($scope, notify){



});

app.service('notify', function(){


    this.go = function(data){
        var notification = {};
        notification.type = data.type;
        switch(notification.type){
            case 'application':{
                notification.user  = data.employerID;
                break;
            }
            case 'status change':{
                break;
            }
            case 'rating':{

            }
        }
        socket.emit('notify',notification);
    };
});

