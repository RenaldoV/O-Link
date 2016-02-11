angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider

		// home page
		.when('/', {
			templateUrl: 'views/page_signin.html'
		})
		.when('/dashboard', {
			templateUrl: 'views/dashboard.html'
		})

		.when('/signIn', {
			templateUrl: 'views/page_signin.html'
		})

		.when('/signUp', {
			templateUrl: 'views/page_signup.html'
		})
		.when('/postJob', {
			templateUrl: 'views/postJob.html'
		})
		.when('/browseJobs', {
		templateUrl: 'views/browseJobs.html'
		});


	$locationProvider.html5Mode(true);

}]);