app.controller('confirmPayment',function($scope, $routeParams, authService, session, $location,$window, $http, cacheUser) {

    var dateTime = new Date();
    var package = $routeParams.package;
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
                        //hierdie if statement case was af
                        //die url's het &amp; gehad inplaas van &, payfast kon nie die get data lees nie
                        if(package == 'Talent_Basic') {
                            //hierdie link het ek direk van payfast se generate button code af gekry nadat ek die sha1 ook in die url gepaste het
                            var url = "https://sandbox.payfast.co.za/eng/process?cmd=_paynow&receiver=paulontong%40me.com&item_name=Talent+Basic&item_description=R29+for+3+further+applications%2C+valid+for+one+week.&amount=29.00&return_url=http%3A%2F%2F154.66.197.62%3A8080%2FpaymentSuccessful%3FpaymentToken%3Dsha1%242f29dec7%241%2483d0ba9926042b013b65e81f512c81f547764ac1&cancel_url=http%3A%2F%2F154.66.197.62%3A8080%2FpaymentCanceled";
                        }
                        else if(package == 'Talent_Classic')
                        {
                            //hierdie links uri escape die sha1 vanself om dit dynamically in die url te inject, boonste een is net vir toets die urls moet dinamic wees
                            var url = "https://sandbox.payfast.co.za/eng/process?cmd=_paynow&receiver=paulontong%40me.com&item_name=Talent+Classic&item_description=R49+for+7+further+applications%2C+valid+for+one+week.&amount=49.00&return_url=http%3A%2F%2F154.66.197.62%3A8080%2FpaymentSuccessful%3FpaymentToken%3D"+paymentToken+"&cancel_url=http%3A%2F%2F154.66.197.62%3A8080%2FpaymentCanceled";
                        }
                        else if(package == 'Talent_Ultimate')
                        {
                            var url = "https://sandbox.payfast.co.za/eng/process?cmd=_paynow&receiver=paulontong%40me.com&item_name=Talent+Ultimate&item_description=R99+for+unlimited+further+applications%2C+valid+for+one+month.&amount=99.00&return_url=http%3A%2F%2F154.66.197.62%3A8080%2FpaymentSuccessful%3FpaymentToken%3D"+paymentToken+"&cancel_url=http%3A%2F%2F154.66.197.62%3A8080%2FpaymentCanceled";
                        }

                        //$scope.url = url; // inject url in hidden element
                        window.location.assign(url);
                        //$("#gotoPayFast").trigger("click"); // trigger click op hidden element
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

app.controller('paymentSuccessful',function($scope, authService, session, $location, $http, cacheUser) {


});