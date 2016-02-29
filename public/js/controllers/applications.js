/**
 * Created by Sean on 2016/02/29.
 */
app.controller('applicationCtrl', function ($scope,$http,cacheUser, session) {

    var user = session.user;
    console.log(user);
    $scope.user = user;

    $http
        .post('/getPp', user)
        .then(function (res) {
            console.log(res);
            $scope.image=res.data;


        });
    if(user._id == session.user._id){
        $("#editLink").show();
    }



});