module.exports = {GetStatsDate: function(){
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    if (parseInt(day) < 10) {
        var t = "0";
        t += day;
        day = t;
    }
    if (parseInt(month) == 13) {
        month = "01";
        year = date.getFullYear() + 1;
    }
    if (parseInt(month) < 10) {
        var t = "0";
        t += month;
        month = t;
    }
    return `${day}.${month}.${year}`;
}};