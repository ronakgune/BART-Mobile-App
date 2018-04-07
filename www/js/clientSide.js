var map;
var directionsDisplay;
var map_source_lat = "";
var map_source_long = "";
var map_dest_lat = "";
var map_dest_long = ""; 
var date_for_map;
const myGoogleKey = "AIzaSyBTGxm6Yf0M7nE42H4-zi935QrXuq5rhbs";

function BodyOnLoad() {
    
    calculateVisitNumber();
    fetchLatestContent();
    loadMap();
    document.getElementById('PlanButton').click();
}


function calculateVisitNumber() {
    try {
        var visitElem = document.getElementById("visitNumber");
        var visitNum = localStorage.getItem("visitNumber");
        visitNum = visitNum ? visitNum : 0;
        visitNum++;
        visitNode = document.createTextNode(visitNum);
        visitElem.appendChild(visitNode);
        localStorage.setItem("visitNumber", visitNum);
    }
    catch (e) {

    }
}

function InitializeMapCallback() {
    var latlng = new google.maps.LatLng(37.7831, -122.4039);
    directionsDisplay = new google.maps.DirectionsRenderer();
    var myOptions = {
        zoom: 10,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map"), myOptions);
    directionsDisplay.setMap(map);
}

function loadMap() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + myGoogleKey + "&callback=InitializeMapCallback";
    var mapRegion = document.getElementById("DisplayMap");
    document.body.appendChild(script);
}


function fetchLatestContent() {
    var timer = setTimeout(function () {
        fetchAndDisplayContent();
        timer = setTimeout(arguments.callee, 30000);
    }, 0)
}

function fetchAndDisplayContent() {
    var srcStn = document.getElementById("sourceSelector");
    var destStn = document.getElementById("destSelector");
    var sourceStation = 0;
    var destinationStation = 0;
    if (srcStn.options.length > 1) {
       sourceStation = srcStn.selectedIndex;
    }
    else {
        if(localStorage.getItem("sourceStationSelectedIndex")){
        sourceStation = localStorage.getItem("sourceStationSelectedIndex");
        }
    }
    if (destStn.options.length > 1) {
        destinationStation = destStn.selectedIndex;
    }
    else {
        if(localStorage.getItem("destStationSelectedIndex")){
        destinationStation = localStorage.getItem("destStationSelectedIndex");
        }
    }
    getStationJson(sourceStation, destinationStation);  
}


function getStationJson(sourceStation, destinationStation) {
    var selectSource = document.getElementById("sourceSelector");
    var selectDest = document.getElementById("destSelector");
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://ronakgune.com:8081/stations', true);
    xhr.send(null);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            var stations = JSON.parse(xhr.response);
            var len = stations.length;

            
            deleteStationList(selectSource, selectDest);
            var sourceOption = document.createElement('option');
            selectSource.appendChild(sourceOption);
            var destOption = document.createElement('option');
            selectDest.appendChild(destOption);

            for (var i = 0; i < len; i++) {
                var sourceOption = document.createElement('option');
                selectSource.appendChild(sourceOption);
                sourceOption.value = stations[i].abbr[0];
                sourceOption.innerHTML = stations[i].name[0];

                var destOption = document.createElement('option');
                selectDest.appendChild(destOption);
                destOption.value = stations[i].abbr[0];
                destOption.innerHTML = stations[i].name[0];
            }
            if (document.getElementById("sourceSelector").selectedIndex !== sourceStation) {
                document.getElementById("sourceSelector").selectedIndex = sourceStation;
                CheckSelection(true);
            }

           if (document.getElementById("destSelector").selectedIndex !== destinationStation) {
                document.getElementById("destSelector").selectedIndex = destinationStation;
                CheckSelection(false);
           }
        }
    }
}

function deleteStationList(srcStn, destStn) {
    if (srcStn.options.length > 1) {
        while (srcStn.options.length != 0) { srcStn.options.remove(0); };
    }
    if (destStn.options.length > 1) {
        while (destStn.options.length != 0) { destStn.options.remove(0); };
    }
}


function CheckSelection(sourceSelected) {
    var srcStnElem = document.getElementById("sourceSelector");
    var sourceStation = srcStnElem.value;
    var desStnElem = document.getElementById("destSelector");
    var destStation = desStnElem.value;
    localStorage.setItem("sourceStationSelectedIndex", srcStnElem.selectedIndex);
    localStorage.setItem("destStationSelectedIndex", desStnElem.selectedIndex);
    
    if (!(sourceStation === "" || destStation === "")) {
        var table = document.getElementById("tripDetailsTable");
        if (table) {
            table.innerHTML = "";
        }
        if (sourceStation === destStation) {
            sourceStation.value = "";
            destStation.selectedIndex = -1;
            alert("Source and destination cannot be same");
        } else {
            getTripDetails();
        }
    }
    getStationInformation(sourceSelected);
}

function initializeTripDetailsTable() {
    var table = document.getElementById("tripDetailsTable");
    var tr = document.createElement('tr');

    var th0 = document.createElement('th');
    th0.innerHTML = "| Departure Time  ";
    tr.appendChild(th0);
    var th1 = document.createElement('th');
    th1.innerHTML = "| Arrival Time  ";
    tr.appendChild(th1);
    var th2 = document.createElement('th');
    th2.innerHTML = "| $";
    tr.appendChild(th2);
    var th3 = document.createElement('th');
    th3.innerHTML = "| Clipper Card";
    tr.appendChild(th3);
    var th4 = document.createElement('th');
    th4.innerHTML = "| Total Trip Time |";
    tr.appendChild(th4);
    table.appendChild(tr);
}

function getTripDetails() {
    initializeTripDetailsTable();
    var sourceStation = document.getElementById("sourceSelector").value;
    var destStation = document.getElementById("destSelector").value;
    var url = "http://ronakgune.com:8081/trips?source=" + sourceStation + "&dest=" + destStation;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send(null);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            var table = document.getElementById("tripDetailsTable");
            var tripInfo = JSON.parse(xhr.response);
            var len = tripInfo.trip.length;
            var timerTime;
            for (var i = 0; i < len; i++) {
                var trip = tripInfo.trip[i].$;
                var cash = trip.fare;
                var clipper = trip.clipper;
                var originTime = trip.origTimeMin;
                var destTime = trip.destTimeMin;
                var tripTime = trip.tripTime;


                var tr = document.createElement('tr');
                var td0 = document.createElement('td');
                td0.innerHTML = originTime;
                tr.appendChild(td0);
                var td1 = document.createElement('td');
                td1.innerHTML = destTime;
                tr.appendChild(td1);
                var td2 = document.createElement('td');
                td2.innerHTML = cash;
                tr.appendChild(td2);
                var td3 = document.createElement('td');
                td3.innerHTML = clipper;
                tr.appendChild(td3);
                var td4 = document.createElement('td');
                td4.innerHTML = tripTime;
                tr.appendChild(td4);
                table.appendChild(tr);

                if (i == 1) {
                    createTimer(originTime);
                }
            }
        }
    }
}

function getStationInformation(sourceStationSelected) {
    var station;
    if (sourceStationSelected) {
        station = document.getElementById("sourceSelector").value;
    } else {
        station = document.getElementById("destSelector").value;
    }

    if (station === "") {
        if (sourceStationSelected) {
            map_source_lat = "";
            map_source_long = "";
        }
        else {
            map_dest_lat = "";
            map_dest_long = "";
        }
        return;
    }

    if (sourceStationSelected) {
        var aside = document.getElementById('sourceStationInfo');
        if (aside.hasChildNodes()) {
            aside.innerHTML = "";
        }
    }

    var url = "http://ronakgune.com:8081/station?source=" + station;
    var xhrSrcInfo = new XMLHttpRequest();
    xhrSrcInfo.open('GET', url, true);
    xhrSrcInfo.send(null);

    xhrSrcInfo.onreadystatechange = function () {
        if (xhrSrcInfo.readyState == XMLHttpRequest.DONE && xhrSrcInfo.status == 200) {
            var station = JSON.parse(xhrSrcInfo.response);
            var stationInfo = station[0];
            setStationInformation(stationInfo, sourceStationSelected);
            drawRoutesOnMap();
        }
    }
}

function setStationInformation(stationInfo, sourceStationSelected) {
    if (sourceStationSelected) {
        var divInfo = document.getElementById('sourceStationInfo');
        map_source_lat = stationInfo["gtfs_latitude"][0];
        map_source_long = stationInfo["gtfs_longitude"][0];
        for (var key in stationInfo) {
            let value = stationInfo[key];
            if (!(typeof value[0] === 'object')) {
                if (key === "name") {
                    var name = document.createElement("h3");
                    name.innerHTML = value[0];
                    divInfo.appendChild(name);
                } else {
                    var para = document.createElement('p');
                    var heading = key.replace("_", " ");
                    if (key === "link") {
                        para.innerHTML = "<strong>" + heading + ":  </strong><a rel=\"external\" href=\"" + value[0] + "\">" + value[0] + "</a>";
                    } else {
                        para.innerHTML = "<strong>" + heading + ":  </strong>" + value[0];
                    }
                    divInfo.appendChild(para)
                }
            }
        }
    }
    else {
        map_dest_lat = stationInfo["gtfs_latitude"][0];
        map_dest_long = stationInfo["gtfs_longitude"][0];
    }
}

function createTimer(originTime) {
    var timeSeperatorIndex = originTime.indexOf(":");
    var originHr = originTime.substring(0, timeSeperatorIndex);
    var typeSeparatorIndex = originTime.indexOf(" ");
    var originMin = originTime.substring(timeSeperatorIndex + 1, typeSeparatorIndex);
    var amPm = originTime.substring(typeSeparatorIndex + 1);
    if (amPm === "PM") {
        if (originHr == 12) {
            originHr = 0;
        } else {
            originHr = parseInt(originHr) + 12;
        }
    }

    var curDate = new Date();
    var originYear = curDate.getFullYear();
    var originMonth = curDate.getMonth() + 1;
    var originDay = curDate.getDate();
    originHr = originHr.length === 1 ? `0${originHr}` : originHr;
    originMin = originMin.length === 1 ? `0${originMin}` : originMin;
    var originSec = '00';

    $("#timer")
        .countdown(`${originYear}/${originMonth}/${originDay} ${originHr}:${originMin}:${originSec}`, function (event) {
            $(this).text(
                event.strftime('%H:%M:%S')
            );
        });
}


function drawRoutesOnMap() {
    
    var selectedMode = "TRANSIT";
    if (map_source_lat && map_source_long && map_dest_lat && map_dest_long) {
        new google.maps.event.trigger(map, 'resize');

        let sourcelatLng = new google.maps.LatLng(map_source_lat, map_source_long);
        let destlatLng = new google.maps.LatLng(map_dest_lat, map_dest_long);
        if (!date_for_map) {
            date_for_map = Date.now();
        }
        let date = Date.now();
        var request = {
            origin: sourcelatLng,
            destination: destlatLng,
            travelMode: google.maps.TravelMode[selectedMode],
            transitOptions: {
                departureTime: date.getTime,
                modes: ['TRAIN'],
            }
        };
        var directionsService = new google.maps.DirectionsService();
        directionsService.route(request, function (response, status) {
            if (status == 'OK') {
                directionsDisplay.setDirections(response);
            }
        });
        return;
    }
}