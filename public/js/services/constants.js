/**
 * Created by Sean on 2016/04/01.
 */

app.service('constants', function(){

    this.categories = ["Coach",
        "Tutor",
        "Delivery Person",
        "Retail Worker",
        "Model",
        "Waiter(res)",
        "Host(ess)",
        "Barman",
        "Aupair",
        "Photographer / Videographer",
        "Programmer/Developer",
        "Engineer","Assistant",
        "Cook/Chef",
        "Other"];

    this.timePeriods = [
        {name: "Once Off", description: "< 1 week"},
        {name:"Short Term",description: "> 1 week and < 1 month"},
        {name:"Long Term", description: "> 1 month"}];

    this.requirements = [
        "Maths",
        "AP Maths",
        "English",
        "Science",
        "Afrikaans",
        "Zulu",
        "IT"
    ];

});