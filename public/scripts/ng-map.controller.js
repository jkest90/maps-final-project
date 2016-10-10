angular.module('NavApp')
    .controller('NavController', NavCtrl);

NavCtrl.$inject=['NgMap', '$timeout', 'NavFactory', '$q'];


/* NavControl */
function NavCtrl(NgMap, $timeout, NavFactory, $q) {
    console.log('Navctrl:loaded!', NavCtrl)
    var nav = this;
    window.nav = nav;
    nav.showInput = false;
    nav.wayPoint = [];
    nav.showPlace = false;
    nav.inputs = [];
    nav.hideButton = true;
    nav.resData = [];
    nav.musicData = [];

/* Requests API through factory's getEvent object */
    function getEvents(collectionOfParams) {
        var requests = collectionOfParams.map(NavFactory.getEvent);

        $q.all(requests).then(function(data){
            data.forEach(function(response, index) {
                nav.resData.push(response);
                console.log("Response", index, '::', response);
                console.log('Response Data', nav.resData);
                nav.pushData()
            });
        })
    }

    nav.pushData = function(result) {
        console.log(nav.resData);
        if(nav.resData){
            nav.resData.forEach(function(element) {
                if (nav.musicData.indexOf(result) == -1) {
                    nav.newShit = element.data.events;
                    nav.musicData.push(nav.newShit);
                    console.log(nav.newShit)
                } else {
                    console.log('error!!!!!!!')
                }
            })
        }
    }
    // nav.resData.map({function(pushData){
    //     var obj = {};
    //     return obj
    // }})


        // nav.resData.map(function() {
        //     var newObj = {};
        //     rObj[obj.key] = obj.value;
        //     return newObj;
        // });




                // for (index in nav.resData) {
                //
                // }
                // function size(response) {
                //     for(var i=0; i<nav.resData.length; i++) {
                //         if(nav.resData.indexOf(response) == -1){
                //             nav.musicData.push(response)
                //         }
                //     }
                // }


/* Loop through musicData array */

    nav.addNewInput = function() {
        nav.showPlace = true;
        nav.inputs.push('');
    }

/* Allows access into google maps autocomplete object */
    nav.placeChanged = function() {
        nav.AutoComplete = this;
    }

/* Function that accesses the getPlace method within the autocomplete object. Returns lat/lng info */
    nav.addWayPoint = function() {
        nav.place = nav.AutoComplete.getPlace()

/* Filters out duplicates and pushes lat/lng info into wayPoint array  */
        var filtered = nav.wayPoint.filter(function(element) {

            console.log(element.location.lat,  nav.place.geometry.location.lat());
            console.log(element.location.lng, nav.place.geometry.location.lng());
            if(element.location.lat === nav.place.geometry.location.lat() && element.location.lng === nav.place.geometry.location.lng() ) {
                console.log("Found a dupe!");
                return true;
            } else {
                console.log("Not a dupe");
                return false;
            }
        });

        if(filtered.length <= 0) {
            console.log("Adding place to array");
            // nav.getEvent(nav.place.geometry.location.lat(), nav.place.geometry.location.lng());
            getEvents([{
                lat:  nav.place.geometry.location.lat(),
                lng:  nav.place.geometry.location.lng(),
                date: nav.formatSplit,
                category: 'music'
            }]);


            nav.wayPoint.push({
                location :{
                    lat: nav.place.geometry.location.lat(),
                    lng: nav.place.geometry.location.lng()
                },
                stopover :true
            });
        }
        else {
            console.log("Place already in array");
        }


/* Prints out legs of trip and pushes address, arrival time, formatted date, and duration into an cityInfo array */
        $timeout(function(){
            console.log("Map ", nav.map);
            console.log("Routes",nav.map.directionsRenderers[0].directions.routes[0]);
            console.log("Leg length", nav.map.directionsRenderers[0].directions.routes[0].legs.length)
            nav.wayDuration = nav.map.directionsRenderers[0].directions.routes[0];
            // console.log("WayDuration ", nav.wayDuration);
            nav.totalDuration = 0;
            nav.cityInfo = [];
            for ( var i = 0; i < nav.wayDuration.legs.length; i++ ) {
                console.log("THESE ARE THE LEGS", nav.map.directionsRenderers[0].directions.routes[0].legs[i]);
                //looping over seconds from point a-b-c etc, and adding it to the total time.
                nav.totalDuration += nav.wayDuration.legs[i].duration.value;
                var time = new Date();
                nav.arrivalTime = new Date(time.setSeconds(time.getSeconds() + nav.wayDuration.legs[i].duration.value));
                nav.moment= moment(nav.arrivalTime).format("YYYY/MM/DD");
                nav.momentSplit = nav.moment.split('/').join('');
                // nav.unix = nav.arrivalTime.getTime()/1000;
                nav.cityInfo.push({
                    start_address: nav.wayDuration.legs[i].start_address,
                    end_address: nav.wayDuration.legs[i].end_address,
                    arrival_time: nav.arrivalTime,
                    format_date: nav.momentSplit,
                    text: nav.wayDuration.legs[i].duration.text,
                    value: nav.wayDuration.legs[i].duration.value
                });
            }
            console.log('city waypoint info pushed', nav.cityInfo);
        }, 500)

    }

/* Pushes origin and destination location/time properties into startFinish array */
    nav.submitAddress = function() {
        var destDuration = 0;
        var newTime = new Date();
        nav.startFinish = [];
        nav.origin = '';
        nav.destination = '';
        nav.hideButton = false;
        nav.origin = nav.originInput;
        nav.destination = nav.destinationInput;
        $timeout(function(){
            nav.tText = nav.map.directionsRenderers[0].directions.routes[0].legs[0].duration.text;
            nav.tValue = nav.map.directionsRenderers[0].directions.routes[0].legs[0].duration.value;
            nav.destTime = new Date(newTime.setSeconds(newTime.getSeconds() + nav.tValue));

            nav.formatMoment = moment(nav.destTime).format("YYYY/MM/DD");
            nav.formatSplit = nav.formatMoment.split('/').join('');
//moment add days - date range
// add an extra input that selects a leave, when a waypoint is added, hit the event api. with at least a date dayrange. by default make it a week range to return at destination B.  //
// only hit the api once for each waypoint. user gets to choose when they lave.
            if(nav.startFinish.filter(function(element) {
                if(element.origin === nav.originInput && element.destination === nav.destinationInput) {
                    console.log('found a dupe!');
                    return true
                } else {
                    console.log('not a dupe!');
                    return false
                }
            }).length <= 0 ){
                nav.startFinish.push({
                    origin: nav.originInput,
                    destination: nav.destinationInput,
                    text: nav.tText,
                    value: nav.tValue,
                    format_date: nav.formatSplit
                });
                console.log('First leg duration pushed')
            } else {
                console.log('didn\'t push first leg')
            }
            console.log('origin/destination info', nav.startFinish);
        }, 500)
    }

  /* function that returns ngMap */
    NgMap.getMap().then(function(map) {
        console.log('ngMap loaded!', map);
        nav.map = map;
        console.log(nav.map.getCenter());
    });

} /* end NavCtrl */
