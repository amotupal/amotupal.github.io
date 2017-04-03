var data = [
    {"status":"http_302","hits":0,"date":"01/03/2013"},
    {"status":"http_200","hits":90,"date":"01/03/2013"},
    {"status":"http_200","hits":200,"date":"01/07/2013"},
    {"status":"http_302","hits":254,"date":"01/06/2013"},
    {"status":"http_200","hits":200,"date":"01/06/2013"},
    {"status":"http_404","hits":123,"date":"01/06/2013"},
    {"status":"http_302","hits":0,"date":"01/05/2013"},
    {"status":"http_200","hits":90,"date":"01/05/2013"},
    {"status":"http_404","hits":65,"date":"01/05/2013"},
    {"status":"http_302","hits":34,"date":"01/04/2013"},
    {"status":"http_200","hits":90,"date":"01/04/2013"},
    {"status":"http_404","hits":123,"date":"01/04/2013"},
    {"status":"http_302","hits":100,"date":"01/07/2013"},
    {"status":"http_404","hits":144,"date":"01/07/2013"},
    {"status":"http_404","hits":28,"date":"01/03/2013"},
    {"status":"http_302","hits":17,"date":"01/02/2013"},
    {"status":"http_200","hits":10,"date":"01/02/2013"},
    {"status":"http_404","hits":1,"date":"01/02/2013"},
    {"status":"http_302","hits":23,"date":"01/01/2013"},
    {"status":"http_200","hits":90,"date":"01/01/2013"},
    {"status":"http_404","hits":2,"date":"01/01/2013"},
    {"status":"http_302","hits":87,"date":"12/31/2012"},
    {"status":"http_200","hits":90,"date":"12/31/2012"},
    {"status":"http_302","hits":100,"date":"12/27/2012"},
    {"status":"http_404","hits":2,"date":"12/27/2012"},
    {"status":"http_200","hits":90,"date":"12/30/2012"},
    {"status":"http_404","hits":2,"date":"12/30/2012"},
    {"status":"http_302","hits":200,"date":"12/29/2012"},
    {"status":"http_200","hits":300,"date":"12/29/2012"},
    {"status":"http_404","hits":116,"date":"12/29/2012"},
    {"status":"http_302","hits":100,"date":"12/28/2012"},
    {"status":"http_200","hits":10,"date":"12/28/2012"},
    {"status":"http_404","hits":77,"date":"12/28/2012"},
    {"status":"http_200","hits":190,"date":"12/27/2012"},
    {"status":"http_404","hits":100,"date":"12/31/2012"},
    {"status":"http_302","hits":0,"date":"12/30/2012"},
    {"status":"http_404","hits":100,"date":"12/31/2012"},
    {"status":"http_404","hits":123,"date":"12/30/2012"},
]; 

var ndx = crossfilter(data);
var parseDate = d3.time.format("%m/%d/%Y").parse;
var numberFormat = d3.format('.2f');
data.forEach(function(d) {
    d.date = parseDate(d.date);
    d.Year = d.date.getFullYear();
    d.Day = d.date.getDay() + 1;
});
/************
Year Ring
*************/
var yearRingChart   = dc.pieChart("#dc-yr-pie-graph","chart");
var yearDim  = ndx.dimension(function(d) {return +d.Year;});
print_filter("yearDim");
var year_total = yearDim.group().reduceSum(function(d) {return d.hits;});
yearRingChart
    .width(180).height(180)
    .legend(dc.legend().x(80).y(70).itemHeight(13).gap(5))
    .dimension(yearDim)
    .group(year_total)
    .innerRadius(45)
    .renderLabel(true)
    .renderTitle(false)
    .colors(["#78CC00","#7B71C5","#56B2EA","#E064CD","#F8B700"])
/************
Status Ring
*************/
var statusRingChart   = dc.pieChart("#dc-sts-pie-graph","chart");
var statusDim  = ndx.dimension(function(d) {return d.status;});
var hit_status = statusDim.group().reduceSum(function(d) {return d.hits;});

statusRingChart
    .width(180).height(180) 
    .legend(dc.legend().x(80).y(70).itemHeight(13).gap(5))
    .dimension(statusDim)
    .group(hit_status)
    .innerRadius(45)
    .renderLabel(true)
    .renderTitle(false)
    .colors(["#78CC00","#7B71C5","#56B2EA","#E064CD","#F8B700"])
/************
Stacked Area Chart
*************/
var hitslineChart  = dc.lineChart("#dc-line-graph","chart");
var dateDim = ndx.dimension(function(d) {return d.date;});
var hits = dateDim.group().reduceSum(function(d) {return d.hits;});
var minDate = dateDim.bottom(1)[0].date;
var maxDate = dateDim.top(1)[0].date;
var status_200=dateDim.group().reduceSum(function(d) {if (d.status==='http_200') {return d.hits;}else{return 0;}});
var status_302=dateDim.group().reduceSum(function(d) {if (d.status==='http_302') {return d.hits;}else{return 0;}});
var status_404=dateDim.group().reduceSum(function(d) {if (d.status==='http_404') {return d.hits;}else{return 0;}});

hitslineChart
    .width(500).height(200)
    .dimension(dateDim)
    .transitionDuration(1000)
    .mouseZoomable(true)
    .group(status_200,"200")
    .stack(status_302,"302")
    .stack(status_404,"404")   
    .renderArea(true)
    .x(d3.time.scale().domain([minDate,maxDate]))
    .elasticX(true)
    .brushOn(true)
    .legend(dc.legend().x(60).y(10).itemHeight(13).gap(5))
    .yAxisLabel("Hits per day")
    .colors(["#78CC00","#7B71C5","#56B2EA","#E064CD","#F8B700"])
    .title(function(d){ return getvalues(d.data);} )
    .margins({ top: 10, left: 50, right: 10, bottom: 50 })  
    .renderlet(function (chart) {chart.selectAll("g.x text").attr('dx', '-30').attr('dy', '-7').attr('transform', "rotate(-90)");});

var volumeChart = dc.barChart("#dc-line-chart","chart");
var dayDim  = ndx.dimension(function(d) {return d.date;});
var day_total = dayDim.group().reduceSum(function(d) {return d.hits;});

//print_filter("day_total");

volumeChart
        .width(500).height(80)
        .margins({ top: 10, left: 50, right: 20, bottom: 20 }) 
        .dimension(dayDim)
        .group(day_total)
        .centerBar(true)
        .gap(2)
        .x(d3.time.scale().domain([minDate,maxDate]))
        .round(d3.time.days.round)
        .xUnits(d3.time.days)
        .elasticX(true)
        .yAxis().ticks(4);

function getvalues(d){
    var str=d.key.getDate() + "/" + (d.key.getMonth() + 1) + "/" + d.key.getFullYear()+"\n";
    var key_filter = dateDim.filter(d.key).top(Infinity);
    var total=0
    key_filter.forEach(function(a) {
        str+=a.status+": "+a.hits+" Hit(s)\n";
        total+=a.hits;
    });
    str+="Total:"+total;
    dateDim.filterAll();
    return str;
} 

dc.renderAll("chart"); 

$('#dc-yr-pie-graph').on('click', function(){

    var minDate2 = dateDim.bottom(1)[0].date;
    var maxDate2 = dateDim.top(1)[0].date;
    console.log("minDate2: ",minDate2,"maxDate2: ",maxDate2)
    hitslineChart.x(d3.time.scale().domain([minDate2,maxDate2]));
    hitslineChart.redraw();
});

var demo;
var states;
var stateRaisedSum;


d3.csv("../data/data.csv", (error, csv) => {

    if (error) {
        console.log("error ::", error)
    }
    else{
        console.log("ccsv: ",csv)
    }
    console.log("I am here!!!!!!!!!!!!!!!!!!!!")
    // console.log("ccsv: ",csv);
    demo = crossfilter(csv);

    states = demo.dimension(function (d) {
        return d["State"];
    });
    stateRaisedSum = states.group().reduceSum(function (d) {
        return d["Raised"];
    });

    print_filter("stateRaisedSum");
    var usChart = dc.geoChoroplethChart("#dc-map-chart","map");
    d3.json("../data/us_states.json", function (statesJson) {
        usChart.width(960)
                .height(500)
                .dimension(states)
                .group(stateRaisedSum)
                .colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
                .colorDomain([0,200])
                .colorAccessor(function (d) { return d})
                .overlayGeoJson(statesJson.features, "state", function (d) {
                    return d.properties.name;
                })
                .valueAccessor(function(kv) {
                    //console.log("kv: ",kv);
                    return kv.value;
                })
                .title(function (d) {
                    return "State: " + d.key + "\nTotal Amount Raised: " + numberFormat(d.value ? d.value : 0) + "M";
                });
        dc.renderAll("map");
    });
});

function print_filter(filter){
    var f=eval(filter);
    if (typeof(f.length) != "undefined") {}else{}
    if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
    if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
    console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
} 