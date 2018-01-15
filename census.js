//average over several tracts
//choice of color gradient--need diverging for neg/pos values
//bins issue--quantiles lump large ranges
//disable keyboard/mouse handlers when editing infobox
//https://gis.stackexchange.com/questions/104507/disable-panning-dragging-on-leaflet-map-for-div-within-map
//doesnt shift timeline when initially loaded; must navigate with mouse first

formula = "POPYY";
// formula = 'NHBLKYY/POPYY';
var n_colors = 10;
var spectrum = d3.interpolatePRGn;
// var counter = 0;
var current_time = 0;
formula = String(formula).replace(/</g, '&lt;').replace(/>/g, '&gt;');
formulas = []
for(var i=0; i<times.length; i++) {
    formulas.push( formula.replace(/YY/g,String(times[i]).slice(2,4)));
}
if(times.length==1) data.features.forEach(f => (f.properties.fill = [f.properties.fill]));
// data.features.forEach(f => {
//     // f.geometry.minLat = f.geometry.minLon = Infinity;
//     // f.geometry.maxLat = f.geometry.maxLon = -Infinity;
//     f.geometry.bbox = {}; f.geometry.bbox.ul = f.geometry.bbox.lr = {};
//     f.geometry.bbox.ul['lat'] = -Infinity; f.geometry.bbox.ul['lng'] = Infinity;
//     f.geometry.bbox.lr['lat'] = Infinity; f.geometry.bbox.lr['lng'] = -Infinity;
//     f.geometry.coordinates[0][0].forEach(x => {
//         with (f.geometry.bbox) {
//             if (x[0] > lr['lng']) {
//                 lr['lng'] = x[0];
//             } else {
//                 if (x[0] < ul['lng']) lr['lng'] = x[0];
//             }
//             if (x[1] < lr['lat']) {
//                 lr['lat'] = x[1];
//             } else {
//                 if (x[1] > ul['lat']) ul['lat'] = x[1];
//             }
//         }
//         // if (x[0] < f.geometry.minLat) f.geometry.minLat = x[0];
//         // if (x[1] < f.geometry.minLon) f.geometry.minLon = x[1];
//         // if (x[0] > f.geometry.maxLat) f.geometry.maxLat = x[0];
//         // if (x[1] > f.geometry.maxLon) f.geometry.maxLon = x[1];
//     });
// });


// updateStats();




// var map = L.map('map', {boxZoom: false}).setView([ 42.30381,-71.09435], 12);
var map = L.map('map').setView([ 42.30381,-71.09435], 12);

L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Positron'
}).addTo(map);
map.attributionControl.setPrefix('');


L.DomUtil.create('div', 'select-box', document.body);
var selectBox = document.getElementsByClassName('select-box')[0];

// interaction handlers
function getNewFormula(e){
    e.preventDefault();
    new_formula = document.getElementById('formula').value

    // new_formula = prompt("new formula",String(formula));
    if (new_formula) formula = new_formula;
    geojson.updateStats(formula);
    geojson.setFillColors(n_colors);
    legend.addTo(map);
}

function listCovariates() {
    var overlay = document.getElementById('covariate-list-container');
    overlay.style.visibility = (overlay.style.visibility=='visible') ? 'hidden' : 'visible';
    document.getElementById('covariate-list').innerHTML = Object.keys(geojson.getLayers()[0].feature.properties).join('<br/>');

}

function updateStats(formula) {
    formulas = []
    for(var i=0; i<times.length; i++) {
	formulas.push( formula.replace(/YY/g,String(times[i]).slice(2,4)));
    }
    data.features.forEach(function(feature) {
	feature.stats = [];
	with(feature.properties) {
            for(var i=0; i<formulas.length; i++) {
		feature.stats.push(eval(formulas[i]));
            }
	}
    })


}


// map.on("boxzoomend", function(e) {
//     alert('!');
//     L.DomEvent.stopPropagation(e.target);

// });

// origin at lower right

selectedLayers = [];


plotSelectedLayers = function() {
    if (selectedLayers.length==0) return;

    // cumStat = selectedLayers[0].feature.properties.stat;

    cumProperties = selectedLayers[0].feature.properties;
    keys = Object.keys(cumProperties);

    for (var i = 1; i<selectedLayers.length; i++) {
        keys.forEach(key => cumProperties[key] += selectedLayers[i].feature.properties[key]);
    }

    cumStat = [];
    for(var i=0; i<formulas.length; i++) {
        with(cumProperties) {
    	    cumStat.push(eval(formulas[i]));
        }
    }

    info.drawSVG(times,cumStat);
}
// function printAverageStats() {
//     var averageStats = Array(times.length).fill(0);
//         selectedLayers.forEach(function(target) {
//             for (var i=0; i < times.length; i++) {
//                 averageStats[i] += target.feature.properties.stat[i];
//             }
//         })
//         averageStats = averageStats.map(function(stat) {return stat/times.length;});
//     info.drawSVG(times,averageStats);
// }

boxZoomMouseUp = function(e){
    var newSelectedLayers = [];
    var boxIntersect = function(ul1,lr1,ul2,lr2) {
        return (ul1['lat'] > lr2['lat']) && (ul2['lat'] > lr1['lat']) && (ul1['lng'] < lr2['lng']) && (ul2['lng'] < lr1['lng']);
    }
    var boxContainsPoint = function(ul,lr,lng,lat) {
        return( ul['lat'] > lat && lr['lat'] < lat && ul['lng'] < lng && lr['lng'] > lng);
    }

    if ((e.which !== 1) && (e.button !== 1)) { return; }

    this._finish();

    if (!this._moved) { return; }
    this._clearDeferredResetState();
    this._resetStateTimeout = setTimeout(L.Util.bind(this._resetState, this), 0);


    startPoint = this._map.containerPointToLatLng(this._startPoint);
    endPoint = this._map.containerPointToLatLng(this._point);
    var ul = {}; var lr = {};
    ul.lat = Math.max(startPoint.lat, endPoint.lat); ul.lng = Math.min(startPoint.lng, endPoint.lng);
    lr.lat = Math.min(startPoint.lat, endPoint.lat); lr.lng = Math.max(startPoint.lng, endPoint.lng);
    geojson.getLayers().forEach(layer => {
        if(boxIntersect(layer.feature.geometry.bbox.ul, layer.feature.geometry.bbox.lr, ul, lr))
            newSelectedLayers.push(layer);
    });
    newSelectedLayers.forEach(layer => {
        with (layer.feature.geometry) {
            for(var i=0; i<coordinates[0][0].length; i++) {
                if (boxContainsPoint(ul,lr,coordinates[0][0][i].lat, coordinates[0][0][i].lng)) {
                    selectedLayers.push(layer);
                    break;
                }
            }
        }
    })

    selectedLayers = selectedLayers.concat(newSelectedLayers);
    selectedLayers.forEach(layer => {highlightFeature(layer)});
    plotSelectedLayers();

}


function highlightFeature(layer) {
    // var layer = e.target;

    layer.setStyle({
        weight: .5,
        color: "#666",
        dashArray: "",
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }


}


function mouseOver(e) {
    highlightFeature(e.target);

    // if(!e.originalEvent.shiftKey) {
    if(selectedLayers.length==0) {
        info.update(e.target.feature.properties);
    }
}

//var selectedLayers = [];


function mouseOut(e) {
    if(selectedLayers.indexOf(e.target)==-1) {
        geojson.resetStyle(e.target);
        // info.update();
    }
}
// function zoomToFeature(e) {
//     map.fitBounds(e.target.getBounds());
//     info.drawSVG(times,e.target.feature.properties.stat);
// }


function onClick(e) {
    if (e.originalEvent.shiftKey) {
        idx = selectedLayers.indexOf(e.target)
        if(idx==-1) {
            selectedLayers.push(e.target);
        } else {
            selectedLayers.splice(idx, 1);
        }
        plotSelectedLayers();
    } else {
        selectedLayers.forEach(function(target) {geojson.resetStyle(target);})
        // info.update();
        // selectedLayers = [];
        // info.drawSVG(times,e.target.feature.properties.stat);
        selectedLayers = [e.target];
        plotSelectedLayers();
    }
}


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

// add hooks
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: mouseOver,
        mouseout: mouseOut,
        click: onClick,
    });
    with(feature) {
        geometry.bbox = {}; geometry.bbox.ul = geometry.bbox.lr = {};
        geometry.bbox.ul['lat'] = -Infinity; geometry.bbox.ul['lng'] = Infinity;
        geometry.bbox.lr['lat'] = Infinity; geometry.bbox.lr['lng'] = -Infinity;
    }
    feature.geometry.coordinates[0][0].forEach(x => {
        with (feature.geometry.bbox) {
            if (x[0] > lr['lng']) {
                lr['lng'] = x[0];
            } else {
                if (x[0] < ul['lng']) lr['lng'] = x[0];
            }
            if (x[1] < lr['lat']) {
                lr['lat'] = x[1];
            } else {
                if (x[1] > ul['lat']) ul['lat'] = x[1];
            }
        }
    })
}


map.boxZoom._onMouseUp = boxZoomMouseUp;

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
    // formulas = []
    // for(var i=0; i<times.length; i++) {
    //     formulas.push( formula.replace(/YY/g,String(times[i]).slice(2,4)));
    // }

    this.getLayers().forEach(layer => {
        // layer.feature.properties.stat = [0,0,0,0];
	with(layer.feature.properties) {
	    layer.feature.properties.stat = [];
            for(var i=0; i<formulas.length; i++) {
    		layer.feature.properties.stat.push(eval(formulas[i]));
            }
	}

        // with(layer.feature) {
        //     geometry.bbox = {}; geometry.bbox.ul = geometry.bbox.lr = {};
        //     geometry.bbox.ul['lat'] = -Infinity; geometry.bbox.ul['lng'] = Infinity;
        //     geometry.bbox.lr['lat'] = Infinity; geometry.bbox.lr['lng'] = -Infinity;
        // }
        // layer.feature.geometry.coordinates[0][0].forEach(x => {
        //     with (layer.feature.geometry.bbox) {
        //         if (x[0] > lr['lng']) {
        //             lr['lng'] = x[0];
        //         } else {
        //             if (x[0] < ul['lng']) lr['lng'] = x[0];
        //         }
        //         if (x[1] < lr['lat']) {
        //             lr['lat'] = x[1];
        //         } else {
        //             if (x[1] > ul['lat']) ul['lat'] = x[1];
        //         }
        //     }
        // })
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
    var svg = d3.select(".info").append("svg").attr("height","300").attr("width","460"),
        margin = {top: 30, right: 20, bottom: 30, left: 60},
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



