var url = "http://localhost:8080/geoserver/wms";
var map;
var scale;
var n2k_dh_geojson;
var marker=null;

var blayer; // global variable for base layer
//body onload function call
function init()
{
	
// adding esri base maps	
blayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Esri WorldImagery'
});

// adding layer from geoserver
/* var ward_boundary = L.tileLayer.wms(url, {
				layers: 'munnro_wrk:munro_ward',
				format: 'image/png',
				transparent: true,
				minZoom: 7,
				//maxZoom: 20,
				attribution: 'Munro boundary'
							
});
addLegend_wd(); */

// adding map container
map = L.map("map", {
      center: [8.99248,76.61239],  //9.0518, 76.5246
      zoom: 14,
	  zoomControl: false,
	  attributionControl: true,
      layers:[blayer]
});
//add scale to the map
scale = L.control.scale(
{
	metric:true,
	imperial:true,
	position:'bottomleft'
}
).addTo(map); 

var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osm = new L.TileLayer(osmUrl, {minZoom: 0, maxZoom: 13, attribution: "OSM" });
//var miniMap = new L.Control.MiniMap(osm, {position:'bottomleft', toggleDisplay: true }).addTo(map);


// Right leaflet Sidebar
sidebar = L.control.sidebar('sidebar', {position: 'right'}).addTo(map);

L.Control.Watermark = L.Control.extend({
		onAdd: function (map) {
			var img = L.DomUtil.create('img');

			img.src = 'image/favicon.png';
			img.style.width = '50px';

			return img;
		},

		onRemove: function (map) {
			// Nothing to do here
		}
	});

L.control.watermark = function (opts) {
	return new L.Control.Watermark(opts);
};
	
var watermarkControl = L.control.watermark({position: 'bottomleft'}).addTo(map);

// Get the label.
var metres = scale._getRoundNum(map.containerPointToLatLng([0, map.getSize().y / 2 ]).distanceTo( map.containerPointToLatLng([scale.options.maxWidth,map.getSize().y / 2 ])))
var label = metres < 1000 ? metres + ' m' : (metres / 1000) + ' km';

// Create the print provider, subscribing to print events
/* printProvider = L.print.provider({
  capabilities: printConfig,
  method: 'GET',
  autoLoad: true,
  dpi: 300,
  //legends: true,
  layout: 'A4 portrait', 
  outputFormat: 'pdf',
  pages: [{
			scale: label,
			geodetic: true}],
  customParams: {
			  mapTitle: 'Munrothuruth Island',
			  comment: 'IKM-KSDI'
		}
}); */
//Create a print control with the configured provider and add to the map
/* printControl = L.control.print({
  provider: printProvider
}); */
//map.addControl(printControl);

//capturing lat,long event
map.addEventListener('mousemove', function(ev) {
   var lat = ev.latlng.lat;
   lat = lat.toFixed(4);
   var lng = ev.latlng.lng;
   lng = lng.toFixed(4);
   document.getElementById("latlng").innerHTML = "<b>" + lat + "</b> , <b>" + lng + "</b>"; 
});


//Zoom Value
map.on("zoomend", showMapZoom);
var currentZoom = document.getElementById("currentZoom");
showMapZoom();
function showMapZoom() {
	currentZoom.innerHTML = "<b>" + map.getZoom() + "</b>";
	var screenDpi = 96;
	var inchPerDecimalDegree = 4374754;
	var mapExtent = map.getBounds();
	var worldWidth = mapExtent._northEast.lng - mapExtent._southWest.lng;
	var screenWidth = map.getSize().x;
	var scale = worldWidth * inchPerDecimalDegree * screenDpi / screenWidth;
	document.getElementById("sm").innerHTML = "<b>" + "1 : " + scale.toFixed(0) + "</b>";
	
}

// Leaflet Full Screen
map.addControl(new L.Control.Fullscreen({
title: {
	'false': 'Fullscreen',
	'true': 'Exit'
}
}));

//Leaflet Measure Tool
L.control.measure({position: 'topleft'}).addTo(map);

// page load
$(document).ready(function() {
        
		//get landuse type
		$.ajax({
            type: "GET",
            url: "php/getlandusetype.php",
            async: false,
            success: function(text) {
				var x="<option>Choose Landuse Type</option>";
			    text=x+text;
                document.getElementById("lsgb_type").innerHTML=text;
		
            }
        });
});

var geojson;
// Info Tool
map.on("click", function(e) {
    openModal();
    var _layers = this._layers,
      layers = [],
      versions = [],
      styles = [];

    for (var x in _layers) {
      var _layer = _layers[x];
      if (_layer.wmsParams) {
        layers.push(_layer.wmsParams.layers);
        versions.push(_layer.wmsParams.version);
        styles.push(_layer.wmsParams.styles);
      }
    }

      var loc = e.latlng,
	  //xy = e.containerPoint, 
	  xy = this.latLngToContainerPoint(loc,this.getZoom()),
      size = this.getSize(),
      bounds = this.getBounds(),
      crs = this.options.crs,
      sw = crs.project(bounds.getSouthWest()),
      ne = crs.project(bounds.getNorthEast()),
      obj = {
        service: "WMS", // WMS (default)
        version: versions[0],
        request: "GetFeatureInfo",
        layers: layers,
        styles: styles[0],
        //bbox: bounds.toBBoxString(), // works only with EPSG4326, but not with EPSG3857
        bbox: sw.x + "," + sw.y + "," + ne.x + "," + ne.y, // works with both EPSG4326, EPSG3857
        width: size.x,
        height: size.y,
        query_layers: layers,
        info_format: "application/json", // text/plain (default), application/json for JSON (CORS enabled servers), text/javascript for JSONP (JSONP enabled servers)
        feature_count: 5 // 1 (default)
        //exceptions: 'application/json', // application/vnd.ogc.se_xml (default)
        // format_options: 'callback: parseResponse' // callback: parseResponse (default), use only with JSONP enabled servers, when you want to change the callback name
      };
    if (parseFloat(obj.version) >= 1.3) {
      obj.crs = crs.code;
      obj.i = xy.x;
      obj.j = xy.y;
    } else {
      obj.srs = crs.code;
      obj.x = xy.x;
      obj.y = xy.y;
    }
    $.ajax({
      url: url + L.Util.getParamString(obj, url, true),
      //dataType: 'jsonp', // use only with JSONP enabled servers
      // jsonpCallback: 'parseResponse', // parseResponse (default), use only with JSONP enabled servers, change only when you changed the callback name in request using format_options: 'callback: parseResponse'
      success: function(data, status, xhr) {
       // var html = "You Clicked @ " + loc + "<br/>";
		closeModal();
        var html="";
		console.log(data);
        if (geojson) {
          map.removeLayer(geojson);
        }
		
		
        if (data.features) {
         var features = data.features;
		 
          if (features.length) {
            //html += "Feature(s) Found: " + features.length;
            // vector = L.geoJSON(data).addTo(map); // works only with EPSG4326, but EPSG3857 doesn't highlights geometry, so we used proj4, proj4leaflet to convert geojson from EPSG3857 to EPSG4326
            geojson = L.Proj.geoJson(data).addTo(map); // works with both EPSG4326, EPSG3857
            for (var i in features) {
              var feature = features[i];
                               
              var properties=feature.properties;
			  
			  var popfind=feature.id
			  var dotpos = popfind.search("\\.");
			  var res=popfind.slice(0,dotpos);
			  //alert(res);
               
              //html+='<br/><table><caption>'+feature.id+'</caption>';
			  //console.log(feature.id);
			  //var str=feature.id;
			  //var res = str.substring(0, 4);
			  //console.log(res);
			  var temp;
			  //var sel = document.getElementById('mp');
			  //var selected = sel.options[sel.selectedIndex];
			  //var mpname = selected.getAttribute('data-foo');
			  
	/* 		  if(res=="land")
			  {
					  //html+='<table class="gridtable">';
						for (var x in properties) {
						if(x!='bbox'){
						  //var fld_name = lookup(x);
						  if (lookup(x)=='Landuse Type')
						  {
							  temp=properties[x];
							  //console.log(temp);
						  }
						  //html+='<tr><td><b>'+ lookup(x) +'</b></td><td>'+properties[x]+'</td></tr>';
						  html+= '<b>' +lookup(x) + "</b> : " + properties[x] + "<br>";
						}
					  }
					  html+='<b>Regulation</b> : <a href="pdf/'+ mpname  +'/' + temp + '.pdf" target=_blank>'+temp+'</a><br>';
					  //html+='<tr><td><b>Regulations</b></td><td><a href="pdf/'+ mpname  +'/' + temp + '.pdf" target=_blank>'+temp+'</a></td></tr>';
					  //html+='</table>';
			  }
			 else
			 {
					  //html+='<table class="gridtable">';
					  for (var x in properties) {
						if(x!='bbox'){
						  //var fld_name = lookup(x);
						  //console.log("inside else");
						  //html+='<tr><td><b>'+ lookup(x) +'</b></td><td>'+properties[x]+'</td></tr>';
						  html+= '<b>' +lookup(x) + "</b> : " + properties[x] + "<br>";
						}
					  }
					  //html+='</table>';
				 
			 } */
			 
			 if(res=="munro_resort")
			 {
				 for (var x in properties) {
						if(x!='bbox'){
						  //var fld_name = lookup(x);
						  if ((x)=='res_img')
						  {
							  temp=properties[x];
							  //console.log(temp);
							   html+='<img src=' + temp + ' width=200px;height=150px><br>';
						  }
						  else{
							  html+= '<b>' + x + "</b> : " + properties[x] + "<br>";
						  }
						  //html+='<tr><td><b>'+ lookup(x) +'</b></td><td>'+properties[x]+'</td></tr>';
						  
						   
						}
					  }
					
				 
			 }
			 else
			 {
				for (var x in properties) {
					if(x!='bbox'){
					  //var fld_name = lookup(x);
					  //console.log("inside else");
					  //html+='<tr><td><b>'+ lookup(x) +'</b></td><td>'+properties[x]+'</td></tr>';
					  html+= '<b>' + x + "</b> : " + properties[x] + "<br>";
					}
				  }
				 
				 
			 }
			 

     		     
             map.openPopup(html, loc,{maxHeight:500});
              
              
            }
          } else {
            html += "No Features Found.";
          }
        } else {
			
          html += "Failed to Read the Feature(s).";
        }
        //map.openPopup(html, loc,{maxHeight:500});
      },
      error: function(xhr, status, err) {
        if (geojson) {
          map.removeLayer(geojson);
        }
        html += "Unable to Complete the Request.: " + err;
        map.openPopup(html, loc);
      }
    });
  });	// end of info tool
	

}// end of init Function

// open modal for loading info
function openModal() {
	document.getElementById('modal').style.display = 'block';
	document.getElementById('fade').style.display = 'block';
}
function closeModal() {
	document.getElementById('modal').style.display = 'none';
	document.getElementById('fade').style.display = 'none';
}



// Got Lat Long Fucntion
function gotolatlong()
{
	//alert("hi");
	var lat,lon;
	lat=$('#ddlat').val();
	lon=$('#ddlon').val();

	if(lat!='' && lon!='')  
	{
		if(isNaN(lat) && isNaN(lon))
		{
			alert("Please enter coordinates in numeric value");
		}
		else{
			
			if (marker != null) map.removeLayer(marker);
			marker = L.marker([lat, lon]);
			map.addLayer(marker);
			map.setView([lat,lon],14);
			map.panTo([lat, lon]);
		}
	}
	else
	{
		alert("Please fill the coordinate values");
	}	
	  
	
}

// Go to latlong clear function
function clearmarker()
{	
if (marker != null) map.removeLayer(marker);
$('#ddlat').val("");
$('#ddlon').val("");	
}

//spatial query for landuse type
function spatialresult_survey()
{
		
	var attributename1=document.getElementById("lsgb_type").value
	$.ajax({
				type: "GET",
				url: "php/spatial_query.php?&attrib_Name1=" + attributename1,
				dataType: 'json',
				//async: false,
				success: function (response) {
				//alert(response);
					removeMarkers();
					n2k_dh_geojson = L.geoJson(response, {
						
						style: function (feature) {
							return {
								color: "red",
								weight: 2,
								fill: false,
								opacity: 1,
								clickable: true
							};
						} ,
						onEachFeature: function (feature, layer) {
							layer.myTag = "myGeoJSON"
						
						}
						
					});
					n2k_dh_geojson.addTo(map);
					map.fitBounds(n2k_dh_geojson.getBounds());
					
				}
	});	// end of ajax call
	
}// end of spatial query function

// to clear the graphics layer 
var removeMarkers = function() {
	map.eachLayer(function(layer) {
	  if ( layer.myTag &&  layer.myTag === "myGeoJSON") {
				map.removeLayer(layer)
		  }

		});
}

//  toggle base map
function togglebasemap(bm)
{
	if(bm=="OSM")
	{
			//alert(bm);
			map.removeLayer(blayer);
			blayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			zIndex:0,
			attribution:'OpenStreetMap'
			});
			blayer.addTo(map);
			
	}
	else if(bm=="ESRI")
	{
			//alert(bm);
			map.removeLayer(blayer);
			blayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
			zIndex:0,
			attribution: 'Esri WorldImagery'
			});
			blayer.addTo(map);
	}
	else{
			//alert(bm);
			map.removeLayer(blayer);
			blayer = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
			  subdomains:['mt0','mt1','mt2','mt3'],
			  zIndex:0,
			  attribution: 'Google Satellite'
			});
			blayer.addTo(map);
	}	
	
}

function addlyr_wd(lyrtheme)
{
	var wd_chk=document.getElementById("munro_ward");

	if(wd_chk.checked==true)
	{
			ward = L.tileLayer.wms(url, {
				layers: "munnro_wrk:" + lyrtheme,
				format: 'image/png',
				transparent: true,
				zIndex:1000,
				//styles :'tcp_jn_mal',
				attribution: 'Ward'
			}).addTo(map);
			addLegend_wd();
			
			
	}
	else
	{
			map.removeLayer(ward);
			removeLegend_wd();		
		
	}

}

function addlyr_lu(lyrtheme)
{
	var lu_chk=document.getElementById("munro_landuse");

	if(lu_chk.checked==true)
	{
			landuse = L.tileLayer.wms(url, {
				layers: "munnro_wrk:" + lyrtheme,
				format: 'image/png',
				zIndex:1000,
				transparent: true,
				//styles :'tcp_jn_mal',
				attribution: 'Landuse'
			}).addTo(map);
			addLegend_lu();
			
			
	}
	else
	{
			map.removeLayer(landuse);
			removeLegend_lu();		
		
	}

}

function addlyr_ca(lyrtheme)
{
	var ca_chk=document.getElementById("munro_cadastry");

	if(ca_chk.checked==true)
	{
			cadastry = L.tileLayer.wms(url, {
				layers: "munnro_wrk:" + lyrtheme,
				format: 'image/png',
				zIndex:1000,
				transparent: true,
				//styles :'tcp_jn_mal',
				attribution: 'Cadastry'
			}).addTo(map);
			addLegend_ca();
	}
	else
	{
			map.removeLayer(cadastry);
			removeLegend_ca();		
	}

}

function addlyr_cl(lyrtheme)
{
	var cl_chk=document.getElementById("munro_canal");

	if(cl_chk.checked==true)
	{
			canal = L.tileLayer.wms(url, {
				layers: "munnro_wrk:" + lyrtheme,
				format: 'image/png',
				zIndex:1000,
				transparent: true,
				//styles :'tcp_jn_mal',
				attribution: 'Canal'
			}).addTo(map);
			addLegend_cl();
			
	}
	else
	{
			map.removeLayer(canal);
			removeLegend_cl();		
	}

}


function addlyr_rd(lyrtheme)
{
	var rd_chk=document.getElementById("munro_road");

	if(rd_chk.checked==true)
	{
			road = L.tileLayer.wms(url, {
				layers: "munnro_wrk:" + lyrtheme,
				format: 'image/png',
				zIndex:1000,
				transparent: true,
				//styles :'tcp_jn_mal',
				attribution: 'Road'
			}).addTo(map);
			addLegend_rd();
			
	}
	else
	{
			map.removeLayer(road);
			removeLegend_rd();
			
		
	}

}

function addlyr_rl(lyrtheme)
{
	var rl_chk=document.getElementById("munro_rail");

	if(rl_chk.checked==true)
	{
			rail = L.tileLayer.wms(url, {
				layers: "munnro_wrk:" + lyrtheme,
				format: 'image/png',
				zIndex:1000,
				transparent: true,
				//styles :'tcp_jn_mal',
				attribution: 'Rail'
			}).addTo(map);
			addLegend_rl();
			
	}
	else
	{
			map.removeLayer(rail);
			removeLegend_rl();
			
		
	}

}


function addlyr_rs(lyrtheme)
{
	var rs_chk=document.getElementById("munro_resort");

	if(rs_chk.checked==true)
	{
			resort = L.tileLayer.wms(url, {
				layers: "munnro_wrk:" + lyrtheme,
				format: 'image/png',
				zIndex:1000,
				transparent: true,
				className: 'blinking',
				//styles :'tcp_jn_mal',
				attribution: 'Resort'
			}).addTo(map);
			addLegend_rs();
			
	}
	else
	{
			map.removeLayer(resort);
			removeLegend_rs();
			
		
	}

}

//Add Legend
//var constructlegend_lu,constructlegend_ca;
function addLegend_wd()
{
	constructlegend_wd='<img src="http://localhost:8080/geoserver/wms?REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=munnro_wrk:munro_ward">';
    document.getElementById("wd").innerHTML=constructlegend_wd;
}
function removeLegend_wd()
{
  document.getElementById("wd").innerHTML="";
}
function addLegend_lu()
{
	constructlegend_lu='<img src="http://localhost:8080/geoserver/wms?REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=munnro_wrk:munro_landuse">';
    document.getElementById("lu").innerHTML=constructlegend_lu;
}
function removeLegend_lu()
{
  document.getElementById("lu").innerHTML="";
}

function addLegend_ca()
{
	constructlegend_ca='<img src="http://localhost:8080/geoserver/wms?REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=munnro_wrk:munro_cadastry">';
    document.getElementById("ca").innerHTML=constructlegend_ca;
}
function removeLegend_ca()
{
  document.getElementById("ca").innerHTML="";
} 


function addLegend_cl()
{
	constructlegend_cl='<img src="http://localhost:8080/geoserver/wms?REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=munnro_wrk:munro_canal">';
    document.getElementById("cl").innerHTML=constructlegend_cl;
}
function removeLegend_cl()
{
  document.getElementById("cl").innerHTML="";
}

function addLegend_rd()
{
	constructlegend_rd='<img src="http://localhost:8080/geoserver/wms?REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=munnro_wrk:munro_road">';
    document.getElementById("rd").innerHTML=constructlegend_rd;
}
function removeLegend_rd()
{
  document.getElementById("rd").innerHTML="";
}  



function addLegend_rl()
{
	constructlegend_rl='<img src="http://localhost:8080/geoserver/wms?REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=munnro_wrk:munro_rail">';
    document.getElementById("rl").innerHTML=constructlegend_rl;
}
function removeLegend_rl()
{
  document.getElementById("rl").innerHTML="";
}  

function addLegend_rs()
{
	constructlegend_rs='<img src="http://localhost:8080/geoserver/wms?REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=munnro_wrk:munro_resort">';
    document.getElementById("rs").innerHTML=constructlegend_rs;
}
function removeLegend_rs()
{
  document.getElementById("rs").innerHTML="";
}  