/**
 * Created by Sean on 2016/03/01.
 */
function getAge(dob){

    var d = dob.split('/');
    var y = parseInt(d[2]);
    var m = parseInt(d[1]);
    var da = parseInt(d[0]);
    var date = new Date();
    var temp = date.getFullYear() - y;

    var month = date.getMonth();
    if(m < month ||(m == month && da < date.getDay()))
    temp++;

    return temp;
}