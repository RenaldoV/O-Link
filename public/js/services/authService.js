
app.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
});
app.constant('USER_TYPES', {
    student: 'student  ',
    employer: 'employer'
})

app.factory('authService', function($http,session){
    var authService ={};

    authService.login = function (credentials) {
        return $http
            .post('/loadUser', credentials)
            .then(function (res) {
                session.create(res.data);
                return res.data;
            });
    };

    authService.isAuthenticated = function () {
        return !!session.user;
    };


    return authService;
});

app.service('session', function () {
    this.create = function (user) {
        this.user = user;
    };
    this.destroy = function () {
        this.user  = null;
    };
});

app.controller('ApplicationController', function ($scope,authService) {
    $scope.currentUser = null;
    $scope.isAuthorized = authService.isAuthorized;

    $scope.setCurrentUser = function (user) {
        $scope.currentUser = user;
    };
});

