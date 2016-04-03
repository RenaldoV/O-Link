////Renaldo se user form scripts, uit sodat dit makliker is om te edit(gebruik vir edit profile ook)

$(function () {
    $("#Individualradio").click(function () {
        $("#Companyradio").prop("checked", false);
        $(".companysection").hide();
    });
    $("#Companyradio").click(function () {
        $("#Individualradio").prop("checked", false);
        $(".companysection").show();
    });
});
//Script for changing between relevant forms

//Employer form validation
$(function () {
    $("input[name=RegNo]").on("invalid", function () {
        this.setCustomValidity("Please enter a valid SA registration number.");
    });
    $("input[name=RegNo]").on("change", function () {
        this.setCustomValidity("");
    });
});
$(function () {
    $("input[name=empID]").on("invalid", function () {
        this.setCustomValidity("Please enter a valid SA ID number.");
    });
    $("input[name=empID]").on("change", function () {
        this.setCustomValidity("");
    });
});
$(function () {
    $("input[name=empEmail]").on("invalid", function () {
        this.setCustomValidity("Please enter a valid email address.");
    });
    $("input[name=empEmail]").on("change", function () {
        this.setCustomValidity("");
    });
});
$(function () {
    $("input[name=empContact]").on("invalid", function () {
        this.setCustomValidity("Please enter a valid SA contact number.");
    });
    $("input[name=empContact]").on("change", function () {
        this.setCustomValidity("");
    });
});
$(function () {
    $("input[name=empPassw]").on("invalid", function () {
        this.setCustomValidity("Password must contain at least 8 characters, 1 alphabet character and 1 number");
    });
    $("input[name=empPassw]").on("change", function () {
        this.setCustomValidity("");
    });
});
$(function () {
    $("input[name=empRePassw]").on("blur", function () {
        if($("input[name=empPassw]").val() != $(this).val())
            this.setCustomValidity("Passwords do not match.");
    });
    $("input[name=empRePassw]").on("change", function () {
        this.setCustomValidity("");
    });
});
$(function () {
    $("input[name=empAdContact]").on("invalid", function () {
        this.setCustomValidity("Please enter a valid SA contact number.");
    });
    $("input[name=empAdContact]").on("change", function () {
        this.setCustomValidity("");
    });
});

$(".reveal").mousedown(function() {
        $(".pwd").get(0).type='text';
    })
    .mouseup(function() {
        $(".pwd").get(0).type='password';
    })
    .mouseout(function() {
        $(".pwd").get(0).type='password';
    });

$(".reveal1").mousedown(function() {
        $(".pwd1").get(0).type='text';
    })
    .mouseup(function() {
        $(".pwd1").get(0).type='password';
    })
    .mouseout(function() {
        $(".pwd1").get(0).type='password';
    });
//Employer form validation


//Student form validation
$(function () {
    $("input[name=stuEmail]").on("invalid", function () {
        this.setCustomValidity("Please enter a valid SA tertiary institute email address.");
    });
    $("input[name=stuEmail]").on("change", function () {
        this.setCustomValidity("");
    });

    $("input[name=stuContact]").on("invalid", function () {
        this.setCustomValidity("Please enter a valid SA contact number.");
    });
    $("input[name=stuContact]").on("change", function () {
        this.setCustomValidity("");
    });

    $("input[name=stuID]").on("invalid", function () {
        this.setCustomValidity("Please enter a valid SA ID number.");
    });
    $("input[name=stuID]").on("change", function () {
        this.setCustomValidity("");
    });
    $("input[name=stuGender]").on("invalid", function () {
        this.setCustomValidity("Please enter a valid gender, M/F.");
    });
    $("input[name=stuGender]").on("change", function () {
        this.setCustomValidity("");
    });
    $("input[name=stuPassw]").on("invalid", function () {
        this.setCustomValidity("Password must contain at least 8 characters, 1 alphabet character and 1 number");
    });
    $("input[name=stuPassw]").on("change", function () {
        this.setCustomValidity("");
    });

    $("input[name=stuRePassw]").on("blur", function () {
        if($("input[name=stuPassw]").val() != $(this).val())
            this.setCustomValidity("Passwords do not match.");
        else
            this.setCustomValidity("");
    });
    $("input[name=stuRePassw]").on("change", function () {
        this.setCustomValidity("");
    });

    $(".reveal2").mousedown(function() {
            $(".pwd2").get(0).type='text';
        })
        .mouseup(function() {
            $(".pwd2").get(0).type='password';
        })
        .mouseout(function() {
            $(".pwd2").get(0).type='password';
        });

    $(".reveal3").mousedown(function() {
            $(".pwd3").get(0).type='text';
        })
        .mouseup(function() {
            $(".pwd3").get(0).type='password';
        })
        .mouseout(function() {
            $(".pwd3").get(0).type='password';
        });

});
//Student form validation

$('#stuDob').datepicker({
    changeMonth: true,
    changeYear: true,
    minDate: new Date(1980, 1 - 1, 1),
    defaultDate: new Date(1990, 1 - 1, 1)
});

