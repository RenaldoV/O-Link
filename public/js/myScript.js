$( document ).ready(function() {
    $(function () {
		$("#Employerradio").click(function () {
			$("#Studentradio").prop("checked", false);
			$("#employerSUForm").show();
			$("#studentSUForm").hide();
		});
		$("#Studentradio").click(function () {
			$("#Employerradio").prop("checked", false);
			$("#studentSUForm").show();
			$("#employerSUForm").hide();
		});
	});
});
