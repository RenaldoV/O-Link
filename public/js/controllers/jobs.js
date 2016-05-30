///////////////////////////////////////////////////////
//////Controllers for the job related activities///////
///////////////////////////////////////////////////////

app.controller('postJob',function($scope, $http, $window, authService, session, $compile, $location, constants, notify, $rootScope){

    $scope.startDate = {
        changeMonth: true,
        changeYear: true,
        minDate: 0,
        onSelect: function(selected){
            $("#endDate").datepicker("option","minDate", selected);
            $scope.job.post.startingDate = selected;
        }
    };
    $scope.endDate = {
        changeMonth: true,
        changeYear: true,
        minDate: 0,
        onSelect: function(selected){
            $scope.job.post.endDate = selected;
        }
    };

    $scope.autocompleteOptions = {
        componentRestrictions: { country: 'za' }
    };
    var geocoder = new google.maps.Geocoder();
    $scope.$on('g-places-autocomplete:select', function (event, param) {
        $scope.job.post.location ={};
        $scope.job.post.location.address = param.formatted_address;
        geocoder.geocode({'address': $scope.job.post.location.address}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                $scope.job.post.location.geo = {type:"Point", coordinates:[results[0].geometry.location.lng(),results[0].geometry.location.lat()]};
                console.log($scope.job.post.location.geo);
            } else {
                console.log('Geocode was not successful for the following reason: ' + status);
            }
        });
    }); // Save location and geometry


    if(!authService.isAuthenticated())
        $window.location.href= '/';
    if(session.user.type != 'employer')
        $window.location.href= '/';

    $rootScope.$broadcast('postJob', 1);
    $scope.timePeriods = constants.timePeriods;
    $scope.categories = constants.categories;
    $scope.reqNames = constants.requirements;
    $scope.expNames = constants.categories;


    //add end date if short term/long term
    $("#times").hide();
    $("#endDateDiv").hide();

    $("#period").change(function(e){

        if(this.value == "Once Off")
        {
            $("#datesLabel").text("Date and Time");
            $("#amount").attr("placeholder","Amount per day");
            $("#endDateDiv").hide();
            $("#times").show();
            var input = $('<div><input type="text" id="startTime" name="startTime" placeholder="Start time" class="form-control no-border" ng-model="job.post.hours.begin" ng-required="true" >' +
                ' <br/><input type="text" id="endTime" name="endTime"  placeholder="End time" class="form-control no-border" ng-model="job.post.hours.end" ng-required="true"> </div>').appendTo("#times");
            $compile(input)($scope);

            $('#startTime').timepicker({ 'step': 15 });
            $('#endTime').timepicker({ 'step': 15 , 'minTime' : '12:00am'});

            $('#startTime').on('changeTime', function() {
                $('#endTime').timepicker({'minTime' : $(this).val(), 'step' : 15});
            });

        }
        else {
            $("#datesLabel").text("Dates");
            $("#amount").attr("placeholder","Amount per hour");
            $("#endDateDiv").show();
            $("#times").hide();
            $("#times").html('');
        }
    });


    //remove requirement from selectable if selected
    var tempReqList = [];
    for(var k = 0; k < $scope.reqNames.length;k++){
        tempReqList.push($scope.reqNames[k]);
    }
    $scope.tempReq = tempReqList;
    $scope.changeSub = function(){


        tempReqList = [];
        for(var k = 0; k < $scope.reqNames.length;k++){
            tempReqList.push($scope.reqNames[k]);
        }

        for(var i = 0; i < $scope.job.post.requirements.length; i++) {
            if ($scope.job.post.requirements[i].name) {

                tempReqList.splice(tempReqList.indexOf($scope.job.post.requirements[i].name), 1);
                $scope.tempReq = tempReqList;


            }
        }
    };

    //remove experience from selectable if selected
    var tempExpList = [];
    for(var l = 0; l < $scope.expNames.length;l++){
        tempExpList.push($scope.expNames[l]);
    }
    $scope.tempExp = tempExpList;
    $scope.changeExp = function(){


        tempExpList = [];
        for(var k = 0; k < $scope.expNames.length;k++){
            tempExpList.push($scope.expNames[k]);
        }

        for(var i = 0; i < $scope.job.post.experience.length; i++) {
            if ($scope.job.post.experience[i].category) {

                tempExpList.splice(tempExpList.indexOf($scope.job.post.experience[i].category), 1);
                $scope.tempExp = tempExpList;


            }
        }
    };



    var reqCount = 0;
    //add requirement

    var btnGrp = $("#reqButtonGrp");
    var inputGrp = $("#reqInputs");

    var now = new Date();
    console.log(now.getDate());

    var user = session.user;
    console.log(user._id);
    $scope.job = {};
    $scope.job.post = {};
    $scope.job.post.requirements = [];
    $scope.job.post.experience = [];
    $scope.job.employerID = user._id;

    $scope.close = function(reqs){

        console.log($scope.job.post.requirements.pop());
    };
    $scope.add = function(){

        if(!$scope.job.post.requirements){
            $scope.job.post.requirements = [{}];
        }else
        console.log($scope.job.post.requirements.push({}));

    };

    $scope.closeExp = function(reqs){

        console.log($scope.job.post.experience.pop());
    };
    $scope.addExp = function(){

        if(!$scope.job.post.experience){
            $scope.job.post.experience = [{}];
        }else
            console.log($scope.job.post.experience.push({}));

    };

    var temp = $location.url();

    if(temp.indexOf("/postJob?id=") > -1) {
        temp = temp.replace("/postJob?id=", '');
        if (temp.trim() != '') {


            $http({
                method: 'POST',
                url: '/getJob',
                data: {id: temp}
            })
                .then(function (res) {

                    $scope.job = res.data;



                });
        }
    }

    $scope.submitForm = function(){

        var job  = jQuery.extend(true, {}, $scope.job);
        if(!$scope.job.status){
            $scope.job.employerID = user._id;


            job.status = 'active';
            $http({
                method  : 'POST',
                url     : '/jobPoster',
                data   : job
            })
                .then(function(response) {
                    {
                        swal({   title: "Posted",   type: "success",   timer: 2000,   showConfirmButton: false });
                        $location.url("/dashboard");
                    }
                });
        }
        else if($scope.job.status == 'inactive' || $scope.job.status == 'Completed'){

            delete job._id;
            delete job.applicants;
            job.status = 'active';
            $http({
                method  : 'POST',
                url     : '/jobPoster',
                data   : job
            })
                .then(function(response) {
                    {
                        swal({   title: "Reposted",   type: "success",   timer: 2000,   showConfirmButton: false });
                        $location.url("/myJobPosts");
                    }
                });
        }
        else if($scope.job.status == 'active'){

            console.log($scope.job);
            swal({
                    title: "Are you sure?",
                    type: "input",
                    text: "This update your post and notify all applicants. Please type your password to confirm",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, I'm sure!",
                    closeOnConfirm: false
                },
                function(inputValue) {

                    $http
                        .post('/checkPassword', {email: user.contact.email, password: inputValue})
                        .then(function (res, err) {
                            console.log(res.data);
                            if (!res.data) {
                                console.log("awww");
                                swal.showInputError("Incorrect Password!");
                                return false;
                            }
                            else{
                                var applicants = $scope.job.applicants;
                                delete job.applicants;
                                job.status = 'active';


                                $http({
                                    method: 'POST',
                                    url: '/jobUpdate',
                                    data: {job:job}
                                })
                                    .then(function (response) {
                                        {
                                            swal({title: "Edited", type: "success", timer: 2000, showConfirmButton: false});

                                            if(applicants){
                                            for(var i = 0; i < applicants.length; i++) {
                                                notify.go({
                                                    type: 'jobEdited',
                                                    jobID: $scope.job._id,
                                                    userID: applicants[i],
                                                    status: 'edited',
                                                    title: $scope.job.post.category
                                                });
                                            }}
                                            $location.url("/myJobPosts");
                                        }
                                    });

                            }

                        });
                });
        }
    };


});

app.controller('jobBrowser',function($scope, $location, $http, $rootScope, session){


    $scope.jobs = [];
    $rootScope.$broadcast('browse', 1);
    $scope.sortBy = 0;
var me = session.user;
    var ob = $.deparam.querystring();
var region = '';
    getJobs(ob);

    //get the jobs
    function getJobs(temp){
        var data = {'categories': temp.categories, 'periods' : temp.timePeriods, 'region': temp.region};
        if(temp.radius){
            data.radius = temp.radius;
            data.userLocation = me.location.geo;
        }
    $http({
        method  : 'POST',
        url     : '/jobBrowse',
        data : data
    })
        .then(function(res) {

                $scope.jobs = res.data;

            angular.forEach($scope.jobs, function(job){
                job.post.postDate = job.post.postDate.substr(0,10);

                var user = {};
                user.profilePicture = job.employerID.profilePicture;

                $http.post('/getPp', user)
                    .then(function (res) {


                        job.logo =  res.data;
                    });
            });

                $scope.getPer = function(cat){
                    if(cat == "Once Off"){
                        return cat;
                    }
                    else return "hr"
                };


        });

    }
    $scope.applyFilters = function(){

        var radius = { max:parseInt($scope.radius)};

        switch(radius.max){
            case 5:{
                radius.min = 0;
                break;
            }
            case 10:{
                radius.min = 5;
                break;
            }
            case 20:{
                radius.min = 10;
                break;
            }
            case 50:
            {
                radius.min = 20;
                break;
            }
            case 2000:{
                radius.min = 50;
                break;
            }
        }

        if($scope.radius) {
            ob.radius = radius;
        }
            if(!$scope.region){
                ob.region = '';
            }
            else{
                ob.region = $scope.region;
            }
            getJobs(ob);



    };

    $scope.sort = function(by){
        if(by == 0){

            $scope.jobs.sort(comparePostDate);
        }
        else
        if(by == 1){

            $scope.jobs.sort(comparePeriod);
        }
        else
        if(by == 2){

            $scope.jobs.sort(compareCategories);
        }

    };

    function comparePostDate(a,b) {
        if (a.post.postDate > b.post.postDate)
            return -1;
        else if (a.post.postDate < b.post.postDate)
            return 1;
        else
            return 0;
    }
    function comparePeriod(a,b) {
        if (a.post.timePeriod < b.post.timePeriod)
            return -1;
        else if (a.post.timePeriod > b.post.timePeriod)
            return 1;
        else
            return 0;
    }
    function compareCategories(a,b) {
        if (a.post.category < b.post.category)
            return -1;
        else if (a.post.category > b.post.category)
            return 1;
        else
            return 0;
    }


});
function getPp(user,cb){

}
app.controller('jobCtrl', function($scope, $location, $window,$http, session, notify, cacheUser, $rootScope){
    var temp = $location.url();
    var user = session.user;
    temp = temp.replace("/job?id=", '');
    id = {id: temp};
    var job = {};
    $scope.canApply = true;
    $scope.edit = function(id){
        $window.location.href= '/postJob?id='+id;
    };
    $http({
        method  : 'POST',
        url     : '/getJob',
        data : id
    })
        .then(function(res) {


            cacheUser.create(res.data.employerID);
            $rootScope.$broadcast('job', cacheUser.user);
            $scope.job = res.data;
            var loc = $scope.job.post.location.address.split(' ').join('+');
            $("#location").prop('src',"https://www.google.com/maps/embed/v1/place?key=AIzaSyDXnlJCOOsZVSdd-iUvTejH13UcZ0-jN0o&q="+loc+"&zoom=13");
            job = res.data;
            if($.inArray(user._id, job.applicants) != -1)
            {
                $scope.hasApplied=true;
                $scope.canApply = false;

            }else

            if(job.employerID._id == user._id){
                $scope.canApply = false;
                $scope.admin = true;

            }else $scope.canApply = true;


            if($scope.hasApplied){
                console.log(user._id + " " +job._id);
                $http
                    .post('/loadApplication', {studentID: user._id, jobID: job._id})
                    .then(function (res, err) {
                        $scope.application = res.data;
                        console.log($scope.application);

                    }
                    );
            }

        });

    $scope.decline = function(id, employerID, jobID, category){
        swal({
                title: "Are you sure?",
                text: "This will notify the user and that you have withdrawn",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, I'm sure!",
                closeOnConfirm: false
            },
            function (isConfirm) {

                if (isConfirm) {
                    $http
                        .post('/declineOffer', {_id: id})
                        .then(function (res, err) {
                            notify.go({
                                type: 'withdrawn',
                                jobID: jobID,
                                userID: employerID,
                                status: 'withdrawn',
                                title: category
                            });
                            swal("Offer declined.", "The user has been notified.", "success");
                            location.reload();

                        });
                }
            });


    };
    $scope.acceptChanges = function(id){
        $http
            .post('/acceptChanges', {id: id})
            .then(function (res, err) {

                swal("Changes accepted.", "The employer has been notified.", "success");
                location.reload();

            });
    };
    $scope.accept = function(id, employerID, jobID, category){
        swal({
                title: "Are you sure?",
                text: "This will notify the user and that you have accepted",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, I'm sure!",
                closeOnConfirm: false
            },
            function (isConfirm) {

                if (isConfirm) {
                    $http
                        .post('/acceptOffer', {_id: id})
                        .then(function (res, err) {
                            notify.go({
                                type: 'accepted',
                                jobID: jobID,
                                userID: employerID,
                                status: 'accepted',
                                title: category
                            });
                            swal("Offer accepted.", "The user has been notified.", "success");
                            location.reload();

                        });
                }

            });

    };

    $scope.delete = function(){

        swal({
                title: "Are you sure?",
                type: "input",
                text: "This will permanently delete this job post. Please type your password to confirm",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, I'm sure!",
                closeOnConfirm: false
            },
            function(inputValue) {

                $http
                    .post('/checkPassword', {email: user.contact.email, password: inputValue})
                    .then(function (res, err) {

                        if (!res.data) {
                            swal.showInputError("Incorrect Password!");
                            return false;
                        }
                        else{
                            $http
                                .post('/removeJob', {id: job._id})
                                .then(function (res, err) {



                                    sweetAlert("Job has beed deleted", "", "success");
                                    if(job.applicants) {
                                        for (var i = 0; i < job.applicants.length; i++) {
                                            notify.go({
                                                type: 'jobDeleted',
                                                jobID: job._id,
                                                userID: job.applicants[i],
                                                status: 'deleted',
                                                title: job.post.category
                                            });
                                        }
                                    }
                                    $window.location.href = '/myJobPosts';

                                });
                        }

                    });


            });
    };

    $scope.apply = function() {

        var meets = [];
        if (typeof job.post.requirements == 'undefined'){
            job.post.requirements = [];

        }else{
            for(var x = 0; x < job.post.requirements.length ; x++)
            {
                meets.push(false);
            }
        }
        if (typeof job.post.experience == 'undefined'){
            job.post.experience = [];

        }else{
            for(x = 0; x < job.post.experience.length ; x++)
            {
                meets.push(false);
            }
        }


        $.each(job.post.requirements, function (key, value) {
            $.each(user.results, function (i, val) {
               
                if(value.name == val.name){
                    if(val.symbol <= value.symbol){
                        meets[key] = true;
                    }
                }
            });
        });

        $.each(job.post.experience, function (key, value) {
            $.each(user.work, function (i, val) {

                if(value.category == val.category){

                        meets[key+job.post.requirements.length] = true;

                }
            });
        });


        if((job.post.gender == "M" || job.post.gender == "F") && job.post.gender != user.gender)
        {
            meets.push(false);
        }
        var met = true;

        if(meets.length > 0){

        $.each(meets, function(key, value){
            console.log(value);
            if(value == false)
            {
                met = false;

            }

        });

        }
        if(job.post.driversLicense != 'undefined')
        {
            //console.log("job license: " + job.post.driversLicense);
            //console.log("user license: " + user.driversLicence);

            if(!user.driversLicence && job.post.driversLicense)
                met = false;
        }
        if(job.post.transport != 'undefined')
        {

            //console.log("job trans: " + job.post.transport);
            //console.log("user trans: " + user.ownTransport);
            if(!user.ownTransport && job.post.transport)
                met = false;
        }
        if(!met){
            sweetAlert("Requirements not met", "", "error");

        }
        else {
            $http({
                method  : 'POST',
                url     : '/apply',
                data : {user : user, job : job }
            })
                .then(function(res) {

                    if(res.data == 'noApps'){
                        sweetAlert("You don't have any applications", "", "error");
                    }
                    else {
                        swal({
                            title: "Success",
                            text: 'Application Successful.',
                            type: "success"
                        }, function () {
                            notify.go({
                                type: 'application',
                                jobID: job._id,
                                userID: job.employerID._id,
                                status: 'Made',
                                title: job.post.category
                            });

                            session.create(res.data);
                            $window.location.href="/dashboard";


                        });
                    }
                });
        }

    };


});

app.controller('pastJobFeed', function($scope,$http, session,$window, $rootScope, $location){

    var user = session.user;

    if($location.path() == "/pastJobPosts"){
        $rootScope.$broadcast('myJobHistory',user);
    }

    $scope.repost = function(id){
        $window.location.href= '/postJob?id='+id;
    };
    $http({
        method  : 'POST',
        url     : '/loadPostHistory',
        data : {employerID: user._id}
    })
        .then(function(res) {
            {
                console.log(res.data);
                $scope.jobs = res.data;
                $.each($scope.jobs, function(key,value){
                    if(!value.applicants)
                    {
                        value.applicants=[];
                    }
                });
                if($scope.jobs.length == 0){
                    $scope.message = "No jobs have been completed, yet.";
                }
            }
        });
});

app.controller('jobHistory', function ($scope,$http,cacheUser, session, $rootScope) {

    var user = cacheUser.user;
    if(!user){
        user = session.user;
    }
    $scope.user = user;

    $rootScope.$broadcast('jobHistory', 1);

    $http
        .post('/loadJobHistory', {studentID : user._id})
        .then(function (res) {

            $scope.applications = res.data;

            if($scope.applications.length == 0)
            {
                $scope.message = "You haven't completed any jobs, yet.";
            }



        });

});


app.controller('employmentHistory', function ($scope,$http,cacheUser, session, $rootScope) {

    var user = cacheUser.user;
    if(!user){
        user = session.user;
    }
    $scope.user = user;

    $rootScope.$broadcast('empHistory', 1);

    $http
        .post('/loadJobHistory', {employerID : user._id})
        .then(function (res) {

            $scope.applications = res.data;

            if($scope.applications.length == 0)
            {
                $scope.message = "No talent has been used, yet.";
            }



        });

});
