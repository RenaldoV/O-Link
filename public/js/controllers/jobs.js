///////////////////////////////////////////////////////
//////Controllers for the job related activities///////
///////////////////////////////////////////////////////

app.controller('postJob',function($scope, $http, $window, authService, session, $compile, $location, constants, notify, $rootScope){

    $('#startTime').timepicker({ 'step': 15  , 'minTime' : '05:00am'});
    $('#endTime').timepicker({ 'step': 15});

    $('#startTime').on('changeTime', function() {
        $('#endTime').timepicker({'minTime' : $(this).val(), 'step' : 15});
    });



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

    $scope.submitForm = function() {

        $scope.submitted = true;
        if ($scope.jobForm.$valid){
            var job = jQuery.extend(true, {}, $scope.job);
        if (!$scope.job.status) {
            $scope.job.employerID = user._id;


            job.status = 'active';
            $http({
                method: 'POST',
                url: '/jobPoster',
                data: job
            })
                .then(function (response) {
                    {
                        swal({title: "Posted", type: "success", timer: 2000, showConfirmButton: false});
                        $location.url("/dashboard");
                    }
                });
        }
        else if ($scope.job.status == 'inactive' || $scope.job.status == 'Completed') {

            delete job._id;
            delete job.applicants;
            job.status = 'active';
            $http({
                method: 'POST',
                url: '/jobPoster',
                data: job
            })
                .then(function (response) {
                    {
                        swal({title: "Reposted", type: "success", timer: 2000, showConfirmButton: false});
                        $location.url("/myJobPosts");
                    }
                });
        }
        else if ($scope.job.status == 'active') {

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
                function (inputValue) {

                    $http
                        .post('/checkPassword', {email: user.contact.email, password: inputValue})
                        .then(function (res, err) {
                            console.log(res.data);
                            if (!res.data) {
                                console.log("awww");
                                swal.showInputError("Incorrect Password!");
                                return false;
                            }
                            else {
                                var applicants = $scope.job.applicants;
                                delete job.applicants;
                                job.status = 'active';


                                $http({
                                    method: 'POST',
                                    url: '/jobUpdate',
                                    data: {job: job}
                                })
                                    .then(function (response) {
                                        {
                                            swal({
                                                title: "Edited",
                                                type: "success",
                                                timer: 2000,
                                                showConfirmButton: false
                                            });

                                            if (applicants) {
                                                for (var i = 0; i < applicants.length; i++) {
                                                    notify.go({
                                                        type: 'jobEdited',
                                                        jobID: $scope.job._id,
                                                        userID: applicants[i],
                                                        status: 'edited',
                                                        title: $scope.job.post.category
                                                    });
                                                }
                                            }
                                            $location.url("/myJobPosts");
                                        }
                                    });

                            }

                        });
                });
        }
    }
    };


});

app.controller('jobBrowser',function($scope, $location, $http, $rootScope, session, constants, $timeout){

    var rad = 15;
    //=======================================================================
    //====================Filter box init
    //========================================================================
    $scope.slider = {
        rangeSlider: 0,
        minValue: 15,
        options: {
            floor: 0,
            ceil: 30,
            minLimit: 2,
            showSelectionBar: true,
            translate: function(value, sliderId, label) {
                switch (label) {
                    case 'model':
                    {
                        if(value >= 30 || value <= 0)
                            return '<b>' + value +'+</b>  kms';
                        else
                            return '<b>' + value +'</b>  kms';
                    }

                    case 'floor':
                        return "<b>" + value + "</b>km and";
                    default:
                        return value + "+ kms";
                }
            },
            onEnd: function() {
                var x = $scope.slider.minValue;
                rad = x;
                //console.log(x + ' km');
                //=======================================================================
                //====================Call apply filter here (range is 1km - "x"km)
                //========================================================================
applyFilters(x);
            }
        }
    };
    function applyFilters(radius,geo){
        if(radius == 30)
        radius = null;
        var data = {};
        if(!$scope.jobCategory || $scope.jobCategory == 'all'){
                data.categories = $scope.categories;
        }
        else data.categories = [$scope.jobCategory];

        if(!$scope.jobPeriod || $scope.jobPeriod == 'all'){
            data.timePeriods = [];
            for(var i = 0; i< $scope.timePeriods.length; i++){
                data.timePeriods.push($scope.timePeriods[i].name);
            }

        }
        else {
            data.timePeriods = [$scope.jobPeriod];
        }

        if(radius){
            data.radius = radius;
if(!geo)
                data.userLocation = session.user.location.geo;
else
    data.userLocation = geo;

        }
       getJobs(data);
    }
    $scope.autocompleteOptions = {
        componentRestrictions: { country: 'za' }
    };
    var geocoder = new google.maps.Geocoder();
    $scope.$on('g-places-autocomplete:select', function (event, param) {
        $scope.resAddress = param.formatted_address;
        $scope.resAddress = $scope.resAddress.split(/,(.+)?/)[0];
        if($scope.resAddress.length > 26)
        {
            $scope.resAddress = $scope.resAddress.substring(0,24)+"...";
        }
        geocoder.geocode({'address':param.formatted_address}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                swal({
                        title: "Are you sure?",
                        type: "input",
                        text: "This will change your residential address. Please type your password to confirm",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, I'm sure!",
                        closeOnConfirm: false
                    },
                    function (inputValue) {

                        $http
                            .post('/checkPassword', {email: session.user.contact.email, password: inputValue})
                            .then(function (res, err) {
                                console.log(res.data);
                                if (!res.data) {
                                    $scope.resAddress = session.user.location.address;
                                    $scope.resAddress = $scope.resAddress.split(/,(.+)?/)[0];
                                    if($scope.resAddress.length > 26)
                                    {
                                        $scope.resAddress = $scope.resAddress.substring(0,24)+"...";
                                    }
                                    swal.showInputError("Incorrect Password!");
                                    return false;
                                }
                                else {
                                    $scope.resAddress = param.formatted_address;
                                    $scope.resAddress = $scope.resAddress.split(/,(.+)?/)[0];
                                    if($scope.resAddress.length > 26)
                                    {
                                        $scope.resAddress = $scope.resAddress.substring(0,24)+"...";
                                    }
                                    var usr = {_id: session.user._id, location:{geo:{lng:results[0].geometry.location.lng(),lat:results[0].geometry.location.lat()},address :param.formatted_address}};
                                    var tmp = session.user;
                                    tmp.location = {geo:{lng:results[0].geometry.location.lng(),lat:results[0].geometry.location.lat()},address :param.formatted_address};
                                    $http({
                                        method: 'POST',
                                        url: '/updateUser',
                                        data: usr
                                    })
                                        .then(function (response) {
                                            {
                                                swal({
                                                    title: "Edited",
                                                    type: "success",
                                                    timer: 2000,
                                                    showConfirmButton: false
                                                });
                                                session.update(tmp, function(t){
                                                    applyFilters($scope.slider.minValue, usr.location.geo);
                                                });
                                                //=======================================================================
                                                //Call apply filter here with new location info if other filters have been applied
                                                //========================================================================

                                            }
                                        });

                                }

                            });
                    });

            } else {
                console.log('Geocode was not successful for the following reason: ' + status);
            }
        });
    }); // Save location and geometry
    $("#searchTextField").click(function(){
        $(this).select();
    });
    $scope.editLocation = function(){
        $scope.editLoc = true;
        $scope.resAddress = session.user.location.address;
        $timeout(function() {
            $("#searchTextField").trigger('click');
        }, 100);

    };
    $scope.locFocusOut = function(){
        $scope.editLoc = false;
        $scope.resAddress = $scope.resAddress.split(/,(.+)?/)[0];
        if($scope.resAddress.length > 26)
        {
            $scope.resAddress = $scope.resAddress.substring(0,24)+"...";
        }
    };
    $scope.resAddress = session.user.location.address.split(/,(.+)?/)[0];
    if($scope.resAddress.length > 26)
    {
        $scope.resAddress = $scope.resAddress.substring(0,24)+"...";
    }
    $scope.categories = constants.categories;
    $scope.timePeriods = constants.timePeriods;
    //=======================================================================
    //====================Filter box init
    //========================================================================


    //=======================================================================
    //====================Filter box filter functions
    //========================================================================
    $scope.mostRecentFilter = function(){
        //console.log("most recent");\
        //=======================================================================
        //Apply most recent filter here
        //========================================================================
        applyFilters(null);
    };
    $scope.categoryFilter = function(){
        //console.log($scope.jobCategory);
        //=======================================================================
        //Apply category filter here with $scope.jobCategory
        //========================================================================
        applyFilters(null);
    };
    $scope.periodFilter = function(){
        //console.log($scope.jobPeriod);
        //=======================================================================
        //Apply period filter here with $scope.jobPeriod
        //========================================================================
        applyFilters(null);
    };




    $scope.jobs = [];
    $rootScope.$broadcast('browse', 1);
    $scope.sortBy = 0;
    var me = session.user;
    var ob = $.deparam.querystring();
    var region = '';
    getJobs(ob);

    //get the jobs
    function getJobs(temp){
        //console.log(temp);
        var data = {'categories': temp.categories, 'periods' : temp.timePeriods, 'region': temp.region};
        if(temp.radius){
            data.radius = temp.radius;
            data.userLocation = temp.userLocation;
        }
        var locat = session.user.location.geo;
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



                job.distance = distance(locat.lat,locat.lng, job.post.location.geo.coordinates[1], job.post.location.geo.coordinates[0]);

            });

                $scope.getPer = function(cat){
                    if(cat == "Once Off"){
                        return cat;
                    }
                    else return "hr"
                };


        });

    }

    function distance(lat1, lon1, lat2, lon2) {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344;

        return Math.round( dist * 10 ) / 10;
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




            $rootScope.$broadcast('job', cacheUser.user);
            $scope.job = res.data;
            var loc = $scope.job.post.location.address.split(' ').join('+');
            $("#location").prop('src',"https://www.google.com/maps/embed/v1/place?key=AIzaSyDXnlJCOOsZVSdd-iUvTejH13UcZ0-jN0o&q="+loc+"&zoom=13");
            job = res.data;

            cacheUser.create(res.data.employerID);
//get profile Picture
            $http
                .post('/getPp', {profilePicture:job.employerID.profilePicture})
                .then(function (res) {

                    job.image = res.data;


                });

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

