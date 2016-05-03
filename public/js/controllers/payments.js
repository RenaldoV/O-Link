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
                        if(package == 'talent_basic') {
                            //hierdie link het ek direk van payfast se generate button code af gekry nadat ek die sha1 ook in die url gepaste het
                            var url = "https://sandbox.payfast.co.za/eng/process?cmd=_paynow&amp;receiver=paulontong%40me.com&amp;item_name=Talent+Basic&amp;item_description=R29+for+3+further+applications%2C+valid+for+one+week.&amp;amount=29.00&amp;return_url=http%3A%2F%2F154.66.197.62%3A8080%2FpaymentSuccessful%3FpaymentToken%3Dsha1%242f29dec7%241%2483d0ba9926042b013b65e81f512c81f547764ac1&amp;cancel_url=http%3A%2F%2F154.66.197.62%3A8080%2FpaymentCanceled";
                        }
                        else if(package == 'talent_classic')
                        {
                            //hierdie links uri escape die sha1 vanself om dit dynamically in die url te inject, boonste een is net vir toets die urls moet dinamic wees
                            var url = "https://sandbox.payfast.co.za/eng/process?cmd=_paynow&amp;receiver=paulontong%40me.com&amp;item_name=Talen+Classic&amp;item_description=R49+for+7+further+applications%2C+valid+for+one+week.&amp;amount=49.00&amp;return_url=http%3A%2F%2F154.66.197.62%3A8080%2FpaymentSuccessful%3FpaymentToken%3D"+paymentToken+"&amp;cancel_url=http%3A%2F%2F154.66.197.62%3A8080%2FpaymentCanceled";
                        }
                        else if(package == 'talent_ultimate')
                        {
                            var url = "https://sandbox.payfast.co.za/eng/process?cmd=_paynow&amp;receiver=paulontong%40me.com&amp;item_name=Talen+Ultimate&amp;item_description=R99+for+unlimited+further+applications%2C+valid+for+one+month.&amp;amount=99.00&amp;return_url=http%3A%2F%2F154.66.197.62%3A8080%2FpaymentSuccessful%3FpaymentToken%3D"+paymentToken+"&amp;cancel_url=http%3A%2F%2F154.66.197.62%3A8080%2FpaymentCanceled";
                        }

                        $scope.url = url; // inject url in hidden element
                        $window.location.href = url;
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