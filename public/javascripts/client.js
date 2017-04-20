$(document).on("pagebeforecreate", client_page_init);
$(document).on("pagecontainerbeforeshow", client_page_load);

//// Variables globales

var geoCapable = navigator.geolocation && true; // Determina si la geolocación es apta.
var currentLocation = null;

//// Utilidades
var pages = {};

function registerCreated(pageCreated) {
    pages[pageCreated] = true;
}

function change_page(to) {
    $(":mobile-pagecontainer").pagecontainer("change", "#" + to);
}

function showLoading() {
    $.mobile.loading('show');
}

function hideLoading() {
    $.mobile.loading('hide');
}

function getCurrentLocation(handler) {
    if (geoCapable) {
        navigator.geolocation.getCurrentPosition(
            function(p) {
                handler(p.coords.longitude, p.coords.latitude);
            },
            function(e) {
                alert("Error al Cargar Ubicación.");
                geoCapable = false;
                handler(null, null);
            }
        ); // getCurrentPosition
    }
}

/// Funciones de la Aplicación

/// Cuando Inicia cada Página
function client_page_init(e) {
    var pageToCreate = $(e.target).attr("id");
    registerCreated(pageToCreate);
    switch (pageToCreate) {
        case "geo_demo_page":
            $("#btn_guardar").on('vclick', btnguardar_onclick);
            break;
    }
}

//// Cuando se Carga 
function client_page_load(e, ui) {

    var pageLoading = $(ui.toPage[0]).attr("id");

    switch (pageLoading) {
        case "geo_demo_page":
            getCurrentLocation(function(long, latt) {
                if (long && latt) {
                    $("#btn_guardar").show();
                    currentLocation = { longitud: long, latitud: latt };
                    $("#geo-demo-loc").html("Guardar(LG:" + long + " LT:" + latt + ")");
                    get_api_locations(latt, long, renderlocations);
                } else {
                    $("#btn_guardar").hide();
                    get_api_locations_nogeo(renderlocations);
                }
            });
            break;
    }

}


function get_api_locations(latt, long, handler) {
    $.post(
        'locations', { latt: latt, long: long },
        function(locations, txtScs, xhrq) {
            handler(locations);
        },
        'json'
    );
}

function add_api_locations(latt, long, handler) {
    $.post(
        'add', { lat: latt, long: long },
        function(ok, txtScs, xhrq) {
            handler();
        },
        'json'
    );
}

function get_api_locations_nogeo(handler) {
    $.get(
        'locations', {},
        function(locations, txtScs, xhrq) {
            handler(locations);
        },
        'json'
    );
}

function btnguardar_onclick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (geoCapable && currentLocation) {
        add_api_locations(currentLocation.latitud, currentLocation.longitud,
            function() {
                get_api_locations(currentLocation.latitud, currentLocation.longitud, renderlocations);
            }
        );
    }
}

function renderlocations(locations) {
    var htmlbuffer = locations.map(
        function(location, i) {
            return '<li>LT: ' + location.geodata.coordinates[1] +
                ' - LG:' + location.geodata.coordinates[0] +
                '<p>' + new Date(location.time).toDateString() + '</p>' +
                '</li>';
        }
    ).join('');
    $("#geo_demo_list").html(htmlbuffer).listview("refresh");

}