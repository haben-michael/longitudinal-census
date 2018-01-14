//average over several tracts
//choice of color gradient--need diverging for neg/pos values
//bins issue--quantiles lump large ranges
//disable keyboard/mouse handlers when editing infobox
//https://gis.stackexchange.com/questions/104507/disable-panning-dragging-on-leaflet-map-for-div-within-map
//doesnt shift timeline when initially loaded; must navigate with mouse first

// formula = "POPYY";
formula = '(NHBLKYY+HISPYY-NHWHTYY-ASIANYY)/POPYY';
var n_colors = 10;
var spectrum = d3.interpolatePRGn;
// var counter = 0;
var current_time = 0;
formula = String(formula).replace(/</g, '&lt;').replace(/>/g, '&gt;');
if(times.length==1) data.features.forEach(f => (f.properties.fill = [f.properties.fill]));
data.features.forEach(f => {
    f.geometry.minLat = f.geometry.minLon = Infinity;
    f.geometry.maxLat = f.geometry.maxLon = -Infinity;
    f.geometry.coordinates[0][0].forEach(x => {
        if (x[0] < f.geometry.minLat) f.geometry.minLat = x[0];
        if (x[1] < f.geometry.minLon) f.geometry.minLon = x[1];
        if (x[0] > f.geometry.maxLat) f.geometry.maxLat = x[0];
        if (x[1] > f.geometry.maxLon) f.geometry.maxLon = x[1];
    });
});


// updateStats();




// var map = L.map('map', {boxZoom: false}).setView([ 42.30381,-71.09435], 12);
var map = L.map('map').setView([ 42.30381,-71.09435], 12);

L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Positron'
}).addTo(map);
map.attributionControl.setPrefix('');


// L.DomUtil.create('div', 'select-box', document.body);
// var selectBox = document.getElementsByClassName('select-box')[0];

// interaction handlers
// function getNewFormula(e){
//     e.preventDefault();
//     new_formula = document.getElementById('formula').value

//     // new_formula = prompt("new formula",String(formula));
//     if (new_formula) formula = new_formula;
//     geojson.updateStats(formula);
//     geojson.setFillColors(n_colors);
//     legend.addTo(map);
// }

// function listCovariates() {
//     var overlay = document.getElementById('covariate-list-container');
//     overlay.style.visibility = (overlay.style.visibility=='visible') ? 'hidden' : 'visible';
//     document.getElementById('covariate-list').innerHTML = Object.keys(geojson.getLayers()[0].feature.properties).join('<br/>');

// }

// function updateStats(formula) {
//     formulas = []
//     for(var i=0; i<times.length; i++) {
// 	formulas.push( formula.replace(/YY/g,String(times[i]).slice(2,4)));
//     }
//     data.features.forEach(function(feature) {
// 	feature.stats = [];
// 	with(feature.properties) {
//             for(var i=0; i<formulas.length; i++) {
// 		feature.stats.push(eval(formulas[i]));
//             }
// 	}
//     })


// }


map.on("boxzoomend", function(e) {
    alert('!');
    L.DomEvent.stopPropagation(e.target);

});

map.boxZoom._onMouseUp = function(e){alert('!')};
// L.Map.BoxPrinter = L.Map.BoxZoom.extend({
//     _onMouseUp: function (e) {
//         alert('!');
//         this._map.fire('boxzoomend', {boxZoomBounds: bounds});
//    }
// })
// L.Map.mergeOptions({boxPrinter: true});
// L.Map.addInitHook('addHandler', 'boxPrinter', L.Map.BoxPrinter);

// L.Map.mergeOptions({boxZoom: false});

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: .5,
        color: "#666",
        dashArray: "",
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    if(!e.originalEvent.shiftKey) {
        info.update(layer.feature.properties);
    }
//    info.drawSVG([2009, 2010, 2011],[20,40,15]);

}

// function resetHighlight(e) {
//     // e.target.setStyle({fillColor : e.target.feature.properties.fill[current_time]});
//     if(!e.originalEvent.shiftKey) {
//         geojson.resetStyle(e.target);
//         info.update();
//     }

// }

var selectedFeatures = [];


function mouseOut(e) {
    if(selectedFeatures.indexOf(e.target)==-1) {
        geojson.resetStyle(e.target);
        info.update();
    }
}
// function zoomToFeature(e) {
//     map.fitBounds(e.target.getBounds());
//     info.drawSVG(times,e.target.feature.properties.stat);
// }



function onClick(e) {
    if (e.originalEvent.shiftKey) {
        if(selectedFeatures.indexOf(e.target)==-1) selectedFeatures.push(e.target);
        averageStats = Array(times.length).fill(0);
        selectedFeatures.forEach(function(target) {
            for (var i=0; i < times.length; i++) {
                averageStats[i] += target.feature.properties.stat[i];
            }
        })
        averageStats = averageStats.map(function(stat) {return stat/times.length;});
        info.drawSVG(times,averageStats);
        // L.DomEvent.stopPropagation(e.target);
    } else {
        selectedFeatures.forEach(function(target) {geojson.resetStyle(target);})
        info.update();
        selectedFeatures = [];
        // map.fitBounds(e.target.getBounds());
        // map.setView(e.target.getCenter());
        info.drawSVG(times,e.target.feature.properties.stat);
    }
}


x1 = 0, y1 = 0, x2 = 0, y2 = 0
;
function reCalc() { //This will restyle the div
    // var x3 = Math.min(x1,x2); //Smaller X
    // var x4 = Math.max(x1,x2); //Larger X
    // var y3 = Math.min(y1,y2); //Smaller Y
    // var y4 = Math.max(y1,y2); //Larger Y
    var minX = Math.min(x1,x2);
    var maxX = Math.max(x1,x2);
    var minY = Math.min(y1,y2);
    var maxY = Math.max(y1,y2);
    selectBox.div.style.left = minX  + 'px';
    selectBox.div.style.top = minY + 'px';
    selectBox.div.style.width = (maxX - minX) + 'px';
    selectBox.div.style.height = (maxY - minY) + 'px';
    selectBox.div.style.border = '10px solid black' ;
    selectBox.div.style.visibility = 'block';
    selectBox.div.style.hidden = 0;
    selectBox.div.style.position = 'absolute';
}

// function reCalc() { //This will restyle the div
//     // var x3 = Math.min(x1,x2); //Smaller X
//     // var x4 = Math.max(x1,x2); //Larger X
//     // var y3 = Math.min(y1,y2); //Smaller Y
//     // var y4 = Math.max(y1,y2); //Larger Y
//     var minX = Math.min(x1,x2);
//     var maxX = Math.max(x1,x2);
//     var minY = Math.min(y1,y2);
//     var maxY = Math.max(y1,y2);
//     selectBox.style.left = minX  + 'px';
//     selectBox.style.top = minY + 'px';
//     selectBox.style.width = (maxX - minX) + 'px';
//     selectBox.style.height = (maxY - minY) + 'px';
//     selectBox.style.border = '10px solid black' ;
//     selectBox.style.visibility = 'block';
//     selectBox.style.hidden = 0;
//     selectBox.style.position = 'absolute';
// }

// function mouseMove(e) {
//     if(e.originalEvent.shiftKey) {
//         x2 = e.originalEvent.clientX;
//         y2 = e.originalEvent.clientY;
//         reCalc();
//                 // L.DomEvent.stopPropagation(e.target);

//     }
// }

// function mouseDown(e) {
//     // alert(e.originalEvent.clientX)
//     if(e.originalEvent.shiftKey) {
//         // selectBox.div.hidden = 0;
//         // selectBox.div.style.visibility = 'block';
//         x1 = e.originalEvent.clientX;
//         y1 = e.originalEvent.clientY;
//         L.DomEvent.stopPropagation(e.target);

//         map.on('mousemove', mouseMove);

//     }
// }

// function mouseUp(e) {
//     // selectBox.hidden = 1;
//     map.off('mousemove', mouseMove);
// }

// map.on('mousedown', mouseDown);
// map.on('mouseup', mouseUp);

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: mouseOut,
        click: onClick,
    });
}



// L.DomUtil.create('div', 'select-box', document.body);
// var selectBox = document.getElementsByClassName('select-box')[0];
// var selectBox =
// var selectBox = document.getElementById('select-box')

// var selectBox = L.control();

// selectBox.onAdd = function (map) {
//     this.div = L.DomUtil.create("div", "select-box");
//     return this.div;
// };
// selectBox.addTo(map);


// var legend = L.control({position: 'bottomright'});

// legend.onAdd = function (map) {
//     var bins = geojson.bins,
//         fills = geojson.fills;
//     // bins.push(1);

//     this.div = L.DomUtil.create('div', 'info legend');
//     var labels = [],



keydownListener = function(e){
    // console.log(current_time);
    if (e.keyCode==37) {
        current_time = current_time-1;
        L.DomEvent.stopPropagation(e);
    };
    if (e.keyCode==39) {
        current_time = current_time+1;
        L.DomEvent.stopPropagation(e);
    };
    current_time = ((current_time%times.length)+times.length)%times.length;
    // console.log(current_time);
    time_elts = document.getElementsByClassName("time_list")[0].childNodes;
    time_elts.forEach(e=>e.className = "timeline_event");
    time_elts[current_time].className = "timeline_event selected";
    geojson.updateTime(current_time);
   // L.DomEvent.stopPropagation(e);
}

document.getElementById('map').addEventListener("keydown",keydownListener);




//geojson
var geojson = L.geoJson(data,
                        {onEachFeature: onEachFeature,
                         style: function(feature){
                            return {
                                weight : 0,
                                // color : "black",
                                fillColor :  feature.properties.fill[current_time],
                                fillOpacity : .3
                            }}})


geojson.updateStats = function() {
    formulas = []
    for(var i=0; i<times.length; i++) {
	formulas.push( formula.replace(/YY/g,String(times[i]).slice(2,4)));
    }

    this.getLayers().forEach(function(e) {
    e.feature.properties.stat = [0,0,0,0];
	with(e.feature.properties) {
	    e.feature.properties.stat = [];
            for(var i=0; i<formulas.length; i++) {
    		e.feature.properties.stat.push(eval(formulas[i]));
            }
	}
    })
}

geojson.setFillColors = function(n_colors) {
    var bin_size = 1/n_colors;
    var range = [];
    for (var n=0; n<=n_colors-1; n++) range.push( (n*bin_size+(n+1)*bin_size)/2);
    var stats = [];
    this.getLayers().forEach(e =>
                             stats.push(...e.feature.properties.stat));
    var scale = d3.scaleQuantile().domain(stats).range(range);

    this.getLayers().forEach(e =>
                             {
				 e.feature.properties.fill = e.feature.properties.stat.map(s => spectrum(scale(s)));
				 e.setStyle({fillColor : e.feature.properties.fill[current_time]});
			     }
			    );

    geojson.bins = [0].concat(scale.quantiles().map(x => +x.toFixed(2)));
    geojson.fills = range.map(x => spectrum(x));

}



geojson.updateTime = function(new_time) {
    //set feature colors
    this.getLayers().forEach(e =>
                             e.setStyle({fillColor : e.feature.properties.fill[new_time]}));
    //set legend colors
}

geojson.updateStats(formula);
geojson.setFillColors(n_colors);
geojson.updateTime(current_time);
geojson.addTo(map);

//info box
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create("div", "info");
    this.update();
    return this._div;
};


info.drawSVG = function(times,stats) {
    this._div.innerHTML = "";
    var svg = d3.select(".info").append("svg").attr("height","300").attr("width","460"),//.style("height","500").style("width","960"),
        margin = {top: 30, right: 20, bottom: 30, left: 40},
         width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			var padding = 30;

    var times = times.map(d => d3.timeParse("%Y")(String(d)));
    var data = times.map((t,i) => ({time:t,stat:stats[i]}))


    //Create scale functions
    var x = d3.scaleTime()
        .rangeRound([0, width])
        .domain(d3.extent(times));
    var y = d3.scaleLinear()
        .rangeRound([height, 0])
        .domain(d3.extent(stats));


    g.append("g")
	.attr("class", "axis axis--x")
	.attr("transform", "translate(0," + height + ")")
	.call(d3.axisBottom(x).ticks(times.length));



    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(stats.length))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .style("text-anchor", "end")
        .text(formula);

    var line = d3.line()
        .x(function(d) { return x(d.time); })
        .y(function(d) { return y(d.stat); });

    g.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);
}

info.update = function (properties) {
    // this._div.innerHTML = '<h4>'+formula+' <button id="change-formula" class="link">change</button></h4>'
    this._div.innerHTML = '<form id="change-formula">'
	+'<input type="text" id="formula" value='+formula + '></form><br>'
        + (properties ? "<b>" + String(properties.NAMELSAD10)
           + "</b><br /><b>" + (properties.stat ? properties.stat[current_time] : 'NA') + "</b>" //+" (" +properties.id +")"
           : '(no selection) |<button id=property-list>list</button>');
    this._div.innerHTML += `<div id="covariate-list-container"><div id="covariate-list" class="info"></div></div>`;

    //  this._div.innerHTML += `
    // <form id="frm1">
    //   First name: <input type="text" name="fname" value="Donald"><br>
    //   <input type="submit" value="Submit">
    // </form>
    // `;

    (hook = document.getElementById('change-formula')) ? hook.addEventListener('submit',function(e){getNewFormula(e);  }) : {};

    // (hook = document.getElementById('formula')) ? hook.addEventListener('focusout',function(e){alert('!');  }) : {};
    // (hook = document.getElementById('formula')) ? hook.addEventListener('click',function(e){console.log('in!');  }) : {};

    (hook = document.getElementById('formula')) ? hook.addEventListener('click',function(e){
        document.getElementById('map').removeEventListener("keydown",keydownListener);
        map.dragging.disable();
    }) : {};
    (hook = document.getElementById('formula')) ? hook.addEventListener('focusout',function(e){
        document.getElementById('map').addEventListener("keydown",keydownListener);
        map.dragging.enable();
    }) : {};


    (hook = document.getElementById('property-list')) ? hook.onclick = function() {
	listCovariates();
    } : {}



    // this.helpdivcontainer = L.DomUtil.create("div",'helpcontainer',this._div);
    // helpdiv = L.DomUtil.create('div','help',this.helpdivcontainer);
    // helpdiv.innerHTML = Object.keys(geojson.getLayers()[0].feature.properties).join('<br/>');
    // helpdiv.innerHTML = ';lkjsf ;lksjf ;lksj df;lkjas dfl;js dfl;sjd fl f';
};

info.addTo(map);
// info.drawSVG([2009, 2010, 2011],[20,40,15]);


//}



//timeline

var timeline;

var timeline = L.control({position:'bottomleft'});
timeline.onAdd = function (map) {
    this.div = L.DomUtil.create("div", "timeline");
    this.inner_div = L.DomUtil.create("div","timeline_grey",this.div);
    this.ol = L.DomUtil.create("ol","time_list",this.div);
    this.ol.style.listStyle = "none";
    notches = [];
    offset = Math.round(80 / (times.length-1));
    for(var i=0; i<times.length; i++) {
        notches.push('<li style="left: ' + (10+i*offset) + '%;" class="timeline_event">' + times[i] + '</li>');
    }
    this.ol.innerHTML = notches.join('');
    this.ol.childNodes[0].className = 'timeline_event selected'
    return this.div;
};

timeline.addTo(map);




// legend

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var bins = geojson.bins,
        fills = geojson.fills;
    // bins.push(1);

    this.div = L.DomUtil.create('div', 'info legend');
    var labels = [],
	from, to;

    for (var i = 0; i < bins.length; i++) {
	// from = bins[i];
	// to = bins[i + 1];

	labels.push(
	    '<i style="background:' + fills[i] + '"></i> ' +
		bins[i] + (i==bins.length-1 ? '+' : ' &mdash; ' + bins[i+1]));
    }

    this.div.innerHTML = labels.join('<br>');
    return this.div;
};

legend.addTo(map);



//		'['+bins[i] + (i<bins.length-1) ? ('&mdash;' + bins[i+1]+')') : '+');
