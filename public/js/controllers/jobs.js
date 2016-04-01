///////////////////////////////////////////////////////
//////Controllers for the job related activities///////
///////////////////////////////////////////////////////

app.controller('postJob',function($scope, $http, $window, authService, session, $compile, $location){



    if(!authService.isAuthenticated())
        $window.location.href= '/';
    if(session.user.type != 'employer')
        $window.location.href= '/';




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
            $('#endTime').timepicker({ 'step': 15 });
            $('#endTime').timepicker({ 'step': 15 });

        }
        else {
            $("#datesLabel").text("Dates");
            $("#amount").attr("placeholder","Amount per hour");
            $("#endDateDiv").show();
            $("#times").hide();
            $("#times").html('');
        }
    });

    var reqCount = 0;
    //add requirement

    var btnGrp = $("#reqButtonGrp");
    var inputGrp = $("#reqInputs");



    $('#addReq').click(function(e){

        reqCount++;
        var reqSelect = $(  '<div class="reqBox'+reqCount+'">' +
            '<select class="form-control no-border" id="sel1" name="how" ng-model="job.post.requirements['+(reqCount-1)+'].name" required">' +
            '<option value="" selected disabled>Choose Requirement</option>' +
            '<option value="Maths">Maths</option>' +
            '<option value="AP Maths">AP Maths</option>' +
            '<option value="English">English</option>' +
            '<option value="Science">Science</option>' +
            '<option value="Afrikaans">Afrikaans</option>' +
            '<option value="Zulu">Zulu</option>' +
            '<option value="IT">IT</option>' +
            '</select>' +
            '<select class="form-control no-border" id="sel1" name="how" ng-model="job.post.requirements['+(reqCount-1)+'].symbol" required">' +
            '<option value="" selected disabled>Choose Symbol</option>' +
            '<option value="A">A (80-100%)</option>' +
            '<option value="B">B (70-79%)</option>' +
            '<option value="C">C (60-69%)</option>' +
            '<option value="D">D (50-59%)</option>' +
            '<option value="F">F (40-49%)</option>' +
            '</select>' +
            '</div>').appendTo(inputGrp);



        if(reqCount <= 1)
        {
            var remBtn = $('<button type="button" class="removeReq btn btn-default" ng-click="close()">Remove<span class="glyphicon glyphicon-minus"></span></button></div>').prependTo(btnGrp);
        }

        $compile(reqSelect)($scope);
        $compile(btnGrp)($scope);

    });

    $(document).on("click", ".removeReq", function(){
        if(reqCount == 1)
            $(this).remove();

        $("#reqInputs .reqBox"+reqCount+"").remove();

        reqCount--;
        $scope.job.post.requirements[reqCount] = {};
    });


    var user = session.user;
    console.log(user._id);
    $scope.job = {};
    $scope.job.post = {};
    $scope.job.post.requirements = {};
    $scope.job.employerID = user._id;

    var temp = $location.url();

    temp = temp.replace("/postJob?id=", '');
    if(temp.trim() != ''){


        $http({
            method  : 'POST',
            url     : '/getJob',
            data : {id:temp}
        })
            .then(function(res) {

                $scope.job = res.data;


            });
    }

    $scope.submitForm = function(){

        if(!$scope.job.status){
            $scope.job.employerID = user._id;
            $scope.job.status = 'active';

            $http({
                method  : 'POST',
                url     : '/jobPoster',
                data   : $scope.job, //forms user object
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
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
                data   : $scope.job, //forms user object
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            })
                .then(function(response) {
                    {
                        swal({   title: "Reposted",   type: "success",   timer: 2000,   showConfirmButton: false });
                        $location.url("/myJobPosts");
                    }
                });
        }
        else if($scope.job.status == 'active'){
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
                                    data: $scope.job, //forms user object
                                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                })
                                    .then(function (response) {
                                        {
                                            swal({title: "Edited", type: "success", timer: 2000, showConfirmButton: false});

                                            sweetAlert("Job has beed deleted", "", "success");
                                            for(var i = 0; i < applicants.length; i++) {
                                                notify.go({
                                                    type: 'jobEdited',
                                                    jobID: job._id,
                                                    userID: applicants[i],
                                                    status: 'edited',
                                                    title: job.post.role
                                                });
                                            }
                                            $location.url("/myJobPosts");
                                        }
                                    });

                            }

                        });
                });
        }
    };


});

app.controller('jobBrowser',function($scope, $location, $http){


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
            {
                $scope.jobs = res.data;
                $scope.getPer = function(cat){
                    if(cat == "Once Off"){
                        return cat;
                    }
                    else return "hr"
                }
            }
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

app.controller('jobCtrl', function($scope, $location, $window,$http, session, notify){
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

            $scope.job = res.data;
            job = res.data;
            if($.inArray(user._id, job.applicants) != -1)
            {
                $scope.canApply = false;

            }else

            if(job.employerID == user._id){
                $scope.canApply = false;
                $scope.admin = true;

            }else $scope.canApply = true;
            console.log(job);



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

        }   else meets = [job.post.requirements.length];

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
        $.each(meets, function(key, value){
            if(value == false)
            {
                met = false;

            }

        });

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
                        title: "success",
                        text: 'Application Successful.',
                        type: "success"
                    },function(){
                        notify.go({
                            type: 'application',
                            jobID: job._id,
                            userID: job.employerID,
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