////Renaldo se user form scripts, uit sodat dit makliker is om te edit(gebruik vir edit profile ook)


//===========================INIT TABS=============================
$(document).ready(function ($) {
    $('#tabs').tab();
});

$(".talentSelected").on("click",function(){
    $(".signupBox").css("border-color", "#33B6CC");
});
$(".employerSelected").on("click",function(){
    $(".signupBox").css("border-color", "#00b488");
});
//==================================================================

//========================TALENT FORM================================================================

//=================ABOUTME CHARS LEFT================
$(function () {
    var text_max = 500;
    $('#textarea_feedback').html(text_max + ' remaining');

    $('#aboutMe').keyup(function() {
        var text_length = $('#aboutMe').val().length;
        var text_remaining = text_max - text_length;

        $('#textarea_feedback').html(text_remaining + ' remaining');
    });
});
//====================================================

$(function () {

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
//========================TALENT FORM================================================================


//========================EMPLOYER FORM==============================================================

//===========================EMPLOYER TYPE RADIOS==================
$(function () {
    $("#Individualradio").click(function () {
        $("#Companyradio").prop("checked", false);
        $(".companysection").hide();
        $("#compName").prop('required',false);
        $("#compDesc").prop('required',false);
        $("#searchTextField").prop('required',false);
    });
    $("#Companyradio").click(function () {
        $("#Individualradio").prop("checked", false);
        $(".companysection").show();
        $("#compName").prop('required',true);
        $("#compDesc").prop('required',true);
        $("#searchTextField").prop('required',true);
    });
});
//==================================================================

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
        this.setCustomValidity("Password must contain at least 6 characters, 1 uppercase character, 1 number and 1 special character");
    });
    $("input[name=empPassw]").on("change", function () {
        this.setCustomValidity("");
    });
});
$(function () {
    $("input[name=empRePassw]").on("focusout", function () {
        if($("input[name=empPassw]").val() != $(this).val())
            this.setCustomValidity("Passwords do not match.");
    });
    $("input[name=empRePassw]").on("change", function () {
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

//========================EMPLOYER FORM VALIDATION================================================================









