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
        var type = $(".pwd2").attr("type");
        if(type == 'password'){
            $(".pwd2").get(0).type='text';
            $(".reveal2 i").removeClass('glyphicon-eye-open');
            $(".reveal2 i").addClass('glyphicon-eye-close');
        }
        else{
            $(".pwd2").get(0).type='password';
            $(".reveal2 i").removeClass('glyphicon-eye-close');
            $(".reveal2 i").addClass('glyphicon-eye-open');
        }
    });

    $(".reveal3").mousedown(function() {
        var type = $(".pwd3").attr("type");
        if(type == 'password'){
            $(".pwd3").get(0).type='text';
            $(".reveal3 i").removeClass('glyphicon-eye-open');
            $(".reveal3 i").addClass('glyphicon-eye-close');
        }
        else{
            $(".pwd3").get(0).type='password';
            $(".reveal3 i").removeClass('glyphicon-eye-close');
            $(".reveal3 i").addClass('glyphicon-eye-open');
        }
    });

});
//========================TALENT FORM================================================================


//========================EMPLOYER FORM==============================================================


$(".reveal").mousedown(function() {
    var type = $(".pwd").attr("type");
    if(type == 'password'){
        $(".pwd").get(0).type='text';
        $(".reveal i").removeClass('glyphicon-eye-open');
        $(".reveal i").addClass('glyphicon-eye-close');
    }
    else{
        $(".pwd").get(0).type='password';
        $(".reveal i").removeClass('glyphicon-eye-close');
        $(".reveal i").addClass('glyphicon-eye-open');
    }
});

$(".reveal1").mousedown(function() {
    var type = $(".pwd1").attr("type");
    if(type == 'password'){
        $(".pwd1").get(0).type='text';
        $(".reveal1 i").removeClass('glyphicon-eye-open');
        $(".reveal1 i").addClass('glyphicon-eye-close');
    }
    else{
        $(".pwd1").get(0).type='password';
        $(".reveal1 i").removeClass('glyphicon-eye-close');
        $(".reveal1 i").addClass('glyphicon-eye-open');
    }
    });

//========================EMPLOYER FORM VALIDATION================================================================









