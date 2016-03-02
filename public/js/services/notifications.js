/**
 * Created by Sean on 2016/03/02.
 */
var socket = io();

app.controller('notifications', function($scope, notify){



});

app.service('notify', function(){

    this.emit = function(data){
        socket.emit('notify',data);
    };
});

