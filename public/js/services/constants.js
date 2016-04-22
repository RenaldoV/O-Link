/**
 * Created by Sean on 2016/04/01.
 */

app.service('constants', function(){

    this.tertiaryInstitutions = ["AFDA",
        "Boston City Campus and Business College",
        "Cape Peninsula University of Technology",
        "Central University of Technology",
        "Cornerstone Institute",
        "CTCFD",
        "Damelin",
        "Durban University of Technology",
        "FEDISA",
        "Helderberg College",
        "IMM Graduate School of Marketing",
        "Inscape Design College",
        "Management College of Southern Africa",
        "Mangosuthu University of Technology",
        "Midrand Graduate Institute",
        "Milpark Business School",
        "Monash South Africa",
        "Nelson Mandela Metropolitan University",
        "North-West University",
        "Rhodes University",
        "Rosebank College",
        "SACAP",
        "Sol Plaatje University",
        "Southern Business School",
        "Stenden University South Africa",
        "The Design School Southern Africa",
        "Tshwane University of Technology",
        "University of Cape Town",
        "University of Fort Hare",
        "University of Johannesburg",
        "University of KwaZulu-Natal",
        "University of Limpopo",
        "University of Mpumalanga",
        "University of Pretoria",
        "University of South Africa",
        "University of Stellenbosch",
        "University of the Free State",
        "University of the Western Cape",
        "University of the Witwatersrand",
        "University of Venda",
        "University of Zululand",
        "Vaal University of Technology",
        "Varsity College",
        "Vega",
        "Walter Sisulu University",
        "Other"];

    this.companyCategories = ["Bar",
        "Catering",
        "Engineering",
        "Film and Media",
        "Financial",
        "Information Technology",
        "Model Agency",
        "Promotion / Events",
        "Restaurant / Café",
        "Retail",
        "School",
        "Take-out Restaurant",
        "Tutoring",
        "University",
        "Other"];

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