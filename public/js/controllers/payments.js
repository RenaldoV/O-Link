app.controller('confirmPayment',function($scope, $routeParams, authService, session, $location,$window, $http) {

    var dateTime = new Date();
    var package = $routeParams.package;
    $scope.package = package.split('_').join(' ');
    switch(package){
        case "Talent_Basic" :
            $scope.price = "R29";break;
        case "Talent_Classic" :
            $scope.price = "R49";break;
        case "Talent_Ultimate" :
            $scope.price = "R99";break;
    }
    var user = session.user;
    var paymentToken = user._id + "+" + dateTime + "+" + package;
    user.paymentToken = paymentToken;
    var packages = {"active": false, 'packageType': package};

    $scope.gotoPayment = function() {

        $http({
            method: 'POST',
            url: '/getPayment',
            data: {"_id" : user._id,  "packages" : {"active" : false,'paymentToken' : paymentToken, "packageType" : package}}
        })
            .then(function (res) {
                {
                    if (res.data) {

                        paymentToken = encodeURIComponent(res.data);

                        var url = "";

                        if(package == 'Talent_Basic') {
                            var url = "https://sandbox.payfast.co.za/eng/process?cmd=_paynow&receiver=paulontong%40me.com&item_name=Talent+Basic&item_description=R29+for+3+further+applications%2C+valid+for+one+week.&amount=29.00&return_url=http%3A%2F%2F154.66.197.62%3A8080%2FpaymentSuccessful%3FpaymentToken%3D"+paymentToken+"%26packageType%3DTalent_Basic&amp;cancel_url=http%3A%2F%2F154.66.197.62%3A8080%2FpaymentCanceled";
                        }
                        else if(package == 'Talent_Classic')
                        {
                            var url = "https://sandbox.payfast.co.za/eng/process?cmd=_paynow&receiver=paulontong%40me.com&item_name=Talent+Classic&item_description=R49+for+7+further+applications%2C+valid+for+one+week.&amount=49.00&return_url=http%3A%2F%2F154.66.197.62%3A8080%2FpaymentSuccessful%3FpaymentToken%3D"+paymentToken+"%26packageType%3DTalent_Classic&amp;cancel_url=http%3A%2F%2F154.66.197.62%3A8080%2FpaymentCanceled";
                        }
                        else if(package == 'Talent_Ultimate')
                        {
                            var url = "https://sandbox.payfast.co.za/eng/process?cmd=_paynow&receiver=paulontong%40me.com&item_name=Talent+Ultimate&item_description=R99+for+unlimited+further+applications%2C+valid+for+one+month.&amount=99.00&return_url=http%3A%2F%2F154.66.197.62%3A8080%2FpaymentSuccessful%3FpaymentToken%3D"+paymentToken+"%26packageType%3DTalent_Ultimate&amp;cancel_url=http%3A%2F%2F154.66.197.62%3A8080%2FpaymentCanceled";
                        }

                        window.location.assign(url);

                    }
                    else
                        swal({
                                title: "Error",
                                text: "Unable to process payment package.",
                                type: "error"
                            },
                            function () {
                                //location.url("/forgot");
                            });


                }
            });

    }
});

app.controller('paymentSuccessful',function($scope,$routeParams, authService, session, $location, $http, cacheUser) {

    var paymentToken = decodeURIComponent($routeParams.paymentToken);
    var packageType = decodeURIComponent($routeParams.packageType);

    $http({
        method: 'POST',
        url: '/checkPaymentToken',
        data: {"_id" : session.user._id, "paymentToken" : paymentToken, "packageType": packageType}
    })
        .then(function (res) {
            {
                if (res.data) { // Valid Token activate package
                    //console.log(res.data);
                    //doen all die nodige hier
                    swal({
                            title: "Payment Successful",
                            text: "Package " + packageType.split('_').join(' ') + " has been successfully activated.",
                            type: "success"
                        },
                        function () {
                            location.href = "/dashboard";
                        });
                }
                else
                    swal({
                            title: "Error",
                            text: "Payment has already been processed.",
                            type: "error"
                        },
                        function () {
                            location.href = "/dashboard";
                        });



            }
        });
});