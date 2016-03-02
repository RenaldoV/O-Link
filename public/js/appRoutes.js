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
		})
		.when('/job', {
			templateUrl: 'views/job.html'
		})
		.when('/profile', {
			templateUrl: 'views/profile.html'
		})

		.when('/forgot', {
			templateUrl: 'views/forgot.html'
		})

		.when('/myProfile', {
			templateUrl: 'views/profile.html'
		})
		.when('/editProfile', {
			templateUrl: 'views/profile.html'
		})
		.when('/applicants', {
			templateUrl: 'views/blocks/applicants.html'
		})
		.when('/myJobPosts', {
			templateUrl: 'views/blocks/employerJobPosts.html'
		})
		.when('/applications', {
		templateUrl: 'views/blocks/applications.html'
	});



	$locationProvider.html5Mode(true);

}]);