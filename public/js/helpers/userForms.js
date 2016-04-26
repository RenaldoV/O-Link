////Renaldo se user form scripts, uit sodat dit makliker is om te edit(gebruik vir edit profile ook)
if (document.addEventListener) {
    document.addEventListener('invalid', function(e) {
        var element = $(e.target);
        element.addClass("invalid");
    }, true);
}
$(document).bind('keypress', function(e){

    if( $(e.target).is(':invalid') ){
        $(e.target).addClass('invalid');
    } else {
        $(e.target).removeClass('invalid');
    }
});

$(function() {
    var dob;
    var idfill;

    $("input[name=stuID]").focusin( function () {
        $("input[name=stuID]").trigger("click");
        dob = $("#stuDob").val();
        idfill = dob.substring(8,10) + dob.substring(0,2) + dob.substring(3,5);
        $(this).val(idfill);
    });
    $("input[name=stuID]").focusout(function (){
        if($(this).val().substring(0,6) != idfill)
            this.setCustomValidity("Date of birth and ID does not match");
    });
    $("input[name=stuID]").on("change", function () {
        this.setCustomValidity("");
    });
});

$("#aboutMe").on("focusout", function () {
    if($("#aboutMe").val().length < 100 || ("#aboutMe").val().length < 500)
        this.setCustomValidity("Please enter more than 100 characters and less than 500 characters.");
    else
        this.setCustomValidity("");
});
$("#aboutMe").on("change", function () {
    this.setCustomValidity("");
});

$(function () {
    var text_max = 500;
    $('#textarea_feedback').html(text_max + ' remaining');

    $('#aboutMe').keyup(function() {
        var text_length = $('#aboutMe').val().length;
        var text_remaining = text_max - text_length;

        $('#textarea_feedback').html(text_remaining + ' remaining');
    });
});

$(".talentSelected").on("click",function(){
   $(".signupBox").css("border-color", "#33B6CC");
});
$(".employerSelected").on("click",function(){
    $(".signupBox").css("border-color", "#00b488");
});

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

$(function () {
    $("#schoolName").hide();
    $("#uniName").hide();
    $("#SecondaryRadio").click(function () {
        $("#TertiaryRadio").prop("checked", false);
        $(".instituteSection").show();
        $("#schoolName").show();
        $("#uniName").hide();
        $("#qualName").hide();
        $("#schoolName").prop('required',true);
        $("#uniName").prop('required',false);
        $("#uniName").prop('required',false);
    });
    $("#TertiaryRadio").click(function () {
        $("#SecondaryRadio").prop("checked", false);
        $(".instituteSection").show();
        $("#uniName").show();
        $("#qualName").show();
        $("#schoolName").hide();
        $("#uniName").prop('required',true);
        $("#qualName").prop('required',true);
        $("#schoolName").prop('required',false);
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
        this.setCustomValidity("Password must contain at least 6 characters, 1 uppercase character, 1 number and 1 special character");
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
    $("input[name=stuEmail]").on("focusout", function () {
        var passed = false;
        this.setCustomValidity("Please enter a valid SA tertiary institute email address.");
        var len = $(this).val().length;
        if(len > 11)
        {
            if($(this).val().substr(len-11,11) == "@tuks.co.za") {
                this.setCustomValidity("");
                passed = true;
            }
        }
        if(len > 4)
        {
            if($(this).val().substr(len-4,4) == ".edu") {
                this.setCustomValidity("");
                passed = true;
            }
        }
        if(len > 6)
        {
            if($(this).val().substr(len-6,6) == ".ac.za")
            {
                this.setCustomValidity("");
                passed = true;
            }
        }
        if(!passed){
            $("input[name=stuEmail]").prop('title',"If you are unable to register with your email address but you are at "+
            "an academic institution, please email info@o-link.co.za from your "+
            "academic email address and we will be sure to add it to our system "+
            "and allow you to register.");
            $("input[name=stuEmail]").tooltip();
        }


    });

    $("input[name=stuContact]").on("invalid", function () {
        this.setCustomValidity("Please enter a valid SA contact number.");
    });
    $("input[name=stuContact]").on("change", function () {
        this.setCustomValidity("");
    });

    $("input[name=stuID]").on("invalid", function () {
        this.setCustomValidity("Please enter a valid ID number.");
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
        this.setCustomValidity("Password must contain at least 6 characters, 1 uppercase character, 1 number and 1 special character");
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





