/**
 * Created by Sean on 2016/02/29.
 */
app.controller('myApplications', function ($scope,$http,cacheUser, session) {

    var user = session.user;
    console.log(user);
    $scope.user = user;

    $http
        .post('/loadApplications', user)
        .then(function (res) {

            $scope.applications = res.data;
            console.log($scope.applications);


        });
    if(user._id == session.user._id){
        $("#editLink").show();
    }



});

