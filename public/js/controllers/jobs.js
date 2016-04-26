///////////////////////////////////////////////////////
//////Controllers for the job related activities///////
///////////////////////////////////////////////////////

app.controller('postJob',function($scope, $http, $window, authService, session, $compile, $location, constants, notify, $rootScope){



    var options = {
        componentRestrictions: {country: 'za'}
    };
    var input = document.getElementById('searchTextField');
    var autocomplete = new google.maps.places.Autocomplete(input,options);
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var data = $("#searchTextField").val();
        $scope.job.post.location = data;
    });

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
            var input = $('<div><input type="text" id="startTime" placeholder="Start time" class="form-control no-border" ng-model="job.post.hours.begin" required >' +
                ' <input type="text" id="endTime"  placeholder="End time" class="form-control no-border" ng-model="job.post.hours.end" required> </div>').appendTo("#times");
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
console.log($scope.job);
        if(!$scope.job.status){
            $scope.job.employerID = user._id;
            $scope.job.status = 'active';
            $http({
                method  : 'POST',
                url     : '/jobPoster',
                data   : $scope.job
            })
                .then(function(response) {
                    {
                        swal({   title: "Posted",   type: "success",   timer: 2000,   showConfirmButton: false });
                        $location.url("/dashboard");
                    }
                });
        }
        else if($scope.job.status == 'inactive'){

            delete $scope.job._id;
            delete $scope.job.applicants;
            $scope.job.status = 'active';
            $http({
                method  : 'POST',
                url     : '/jobPoster',
                data   : $scope.job
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
                                delete $scope.job.applicants;
                                $scope.job.status = 'active';


                                $http({
                                    method: 'POST',
                                    url: '/jobUpdate',
                                    data: {job:$scope.job}
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
                                                    title: $scope.job.post.role
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

app.controller('jobBrowser',function($scope, $location, $http, $rootScope){


    $scope.jobs = [];
    $rootScope.$broadcast('browse', 1);
    $scope.sortBy = 0;
    var temp = $location.url();
    var temp = temp.split("&");
    temp[0] = temp[0].replace("/browseJobs?categories=", '');
    temp[0] = temp[0].replace(/_/g, ' ');
    var arr = temp[0].split("%25");

    var arr2 = [];
    if(temp[1]){
        temp[1] = temp[1].replace("timePeriods=", '');
        temp[1] = temp[1].replace(/_/g, ' ');
        arr2 = temp[1].split("%25");
    }
    //get the jobs
    $http({
        method  : 'POST',
        url     : '/jobBrowse',
        data : {'categories': arr, 'periods' : arr2}
    })
        .then(function(res) {

                $scope.jobs = res.data;

            angular.forEach($scope.jobs, function(job){
                job.post.postDate = job.post.postDate.substr(0,10);
                console.log(job);
                var user = {};
                user.profilePicture = job.employerID.profilePicture;

                $http.post('/getPp', user)
                    .then(function (res) {

                        console.log(job);
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
            var loc = $scope.job.post.location.split(' ').join('+');
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




        });

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
                                                title: job.post.role
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
            for(var x = 0; x < job.post.requirements.length; x++)
            {
                meets.push(false);
            }
        }

        $.each(job.post.requirements, function (key, value) {
            $.each(user.results, function (i, val) {
                if(value.name == val.name){
                    if(val.result <= value.symbol){
                        meets[key] = true;
                    }
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

                    console.log(res);
                    swal({
                        title: "Success",
                        text: 'Application Successful.',
                        type: "success"
                    },function(){
                        notify.go({
                            type: 'application',
                            jobID: job._id,
                            userID: job.employerID._id,
                            status: 'Made',
                            title: job.post.role
                        });


                        $window.location.href= '/';
                    });
                });
        }

    };


});

app.controller('pastJobFeed', function($scope,$http, session,$window){

    var user = session.user;

    $scope.repost = function(id){
        $window.location.href= '/postJob?id='+id;
    };
    $http({
        method  : 'POST',
        url     : '/loadJobHistory',
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
            }
        });
});