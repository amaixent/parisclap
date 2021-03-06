// Contrôleur de la page ballades
routeAppControllers.controller('BalladesCtrl',['$scope', 'balladeDataService', '$window', '$timeout', function($scope, balladeDataService, $window, $timeout){
//$window.navigator.geolocation.getCurrentPosition(function(position) {

    $scope.message = "NOUVELLE VAGUE";
/*          var lat = position.coords.latitude;
            var lng = position.coords.longitude;*/
        // On code lat et lng en dur pour simuler que nous nous trouvons dans Paris
        var lat = 48.854667;
        var lng = 2.347735;


        //$timeout(function(){
            //$scope.$apply(function(){
                // Récuperation des données pour le marqueur de position
                $scope.mylat = lat;
                $scope.mylng = lng;
                // Test périmetre
                if ( (lat > 48.81229 ) && (lat < 48.905351) && (lng < 2.423) && (lng > 2.243443) )
                {
                    //Si nous sommes dans le perimetre : on centre sur notre position
                    $scope.lat = lat;
                    $scope.lng = lng;
                    $scope.zoom = 15;
                }
                else
                {
                    //Si nous sommes hors du perimetre : on centre sur Paris
                    $scope.lat =48.856614;
                    $scope.lng = 2.3522219000000177;
                    $scope.zoom = 12;
                }
           // });
        //})


        var mapOptions = {
            zoom: $scope.zoom,
            center: new google.maps.LatLng($scope.lat,$scope.lng),
            mapTypeId: google.maps.MapTypeId.TERRAIN
        }

        $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setOptions( { suppressMarkers: true, preserveViewport:true} );
        directionsDisplay.setMap($scope.map);

        //Affichage de notre localisation
        var myLoc = new google.maps.Marker({
            map: $scope.map,
            position: {lat: $scope.mylat, lng: $scope.mylng},
            icon: 'images/me.png',
            title: "Votre position",
        });

        $scope.markers = [];

        var infoWindow = new google.maps.InfoWindow();

        var colorMarker = function(genre) {
            var filtres = [
                "Action",
                "Adventure",
                "Comedy",
                "Horror",
                "Drama",
                "Romance",
                "Thriller"
            ];

            switch (genre) {
                //ComedyDrama
                case "Comedy, Drama, Music":
                    return "ComedyDrama";
                //ComedyRomance
                case "Comedy, Romance":
                case "Comedy, Drama, Romance":
                    return "ComedyRomance";
                //Comedy
                case "Comedy":
                    return "Comedy";
                //Horror
                case "Drama, Horror":
                case "Drama, Horror, Thriller":
                    return "Horror";
                //DramaRomance
                case "Drama, Romance":
                case "Crime, Drama, Romance":
                    return "DramaRomance";
                //Drama
                case "Drama":
                case "Crime, Drama":
                    return "Drama";
                case genre.substring(0, genre.indexOf(",", 0)):

                //Other
                default:
                    for(var i = 0; i<7; i++){
                        if(genre.substring(0, genre.indexOf(",", 0)) === filtres[i]){
                            return filtres[i];
                        }
                    }
            }
            return "Other";
        }
        var createMarker = function(info){
            // gestion couleur marqueur
            console.log(info);
            if(info.genre) var colorM = colorMarker(info.genre);
            else colorM = "Other";

            console.log("create Marker");

            var marker = new google.maps.Marker({
                map: $scope.map,
                position: new google.maps.LatLng(info.lat, info.lng),
                title: info.titre,
                options: {
                    icon:'images/mapPins/' + colorM + '.png'
                }
            });
            google.maps.event.addListener(marker, 'click', function(){
               var data = [];
               console.log(info.titre);
               if(info.titre == "les quatre cents coups" ) {
                    console.log('les 400 coups de fdp');
                    marker.content = '<div class="infoWindowContent"><img src="'+info.poster+'"></img><div id ="content" class="content"><p><b>blob :</b> '+ info.real+'</p><p><b>Sortie :</b> ' + info.year +'</p><p><b>Genre :</b> '+ info.genre+ '</p><p><b>Acteurs :</b> '+info.Actors+'</p></div>';
                }



                else {
                    data = jsonSyncLoad( "http://www.omdbapi.com/?t="+info.titre+"&y=&plot=full&r=json");
                if(data.Poster == 'N/A')
                {
                    marker.content = '<div class="infoWindowContent"><div id ="content" class="content"><p><b>blob :</b> '+ data.Director+'</p><p><b>Sortie :</b> ' + data.Year +'</p><p><b>Genre :</b> '+ data.Genre+ '</p><p><b>Acteurs :</b> '+data.Actors+'</p>';
                }
                    marker.content = '<div class="infoWindowContent"><img src="http://img.omdbapi.com/?i='+data.imdbID+'&apikey=dab7b153"></img><div class="content"><div id ="content"><p><b>Réalisateur :</b> '+ data.Director+'</p><p><b>Sortie :</b> ' + data.Year +'</p><p><b>Genre :</b> '+ data.Genre+ '</p><p><b>Acteurs :</b> '+data.Actors+'</p></div></div>';

                }
                    infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
                    infoWindow.open($scope.map, marker);

                });
            $scope.markers.push(marker);
        }


        $scope.calcRoute = function(latitude,longitude)
        {
        	console.log("calcroute")
           current_pos = new google.maps.LatLng($scope.mylat,$scope.mylng);
           end_pos = new google.maps.LatLng(latitude,longitude);

           var dirService = new google.maps.DirectionsService();


           var first = new google.maps.LatLng(48.87184639, 2.33964230); // les 400 coups
           var second = new google.maps.LatLng(48.8534043, 2.345649099); // a bout de souffle
           var third = new google.maps.LatLng(48.8604502, 2.34222120); // cléo de 5 a 7

           var request = {

               origin:current_pos,
               destination:end_pos,
               waypoints: [{location: first, stopover: true},
                        {location: second, stopover: true},
                        {location: third, stopover: true}],
               optimizeWaypoints: true,
               travelMode: google.maps.TravelMode.WALKING
           };

           dirService.route(request, function(result, status) {
               if (status == google.maps.DirectionsStatus.OK) {

                console.log(result);
                    result.routes[0].legs[0].end_address = "Les quatre cents coups";
                    result.routes[0].legs[1].end_address = "Cléo de 5 à 7";
                    result.routes[0].legs[2].end_address = "À bout de souffle";
                    result.routes[0].legs[3].end_address = "Pierrot le fou";

                    directionsDisplay.setDirections(result);

                        balladeDataService.getFilms().then(function(data){
                        for (i = 0; i < data.data.length; i++){
                             if(data.data[i].lat !== 0) {
                                createMarker(data.data[i])
                                console.log(data.data[i]);
                            }

                         }
                         $scope.movies = data.data;
                        })

                }
                else{
                    console.log("pas ok :(");
                }
        });

           directionsDisplay.setPanel(document.getElementById("map-panel"));
           //destination finale de l'itinéraire :



       };

       // Pierrot le fou

       var finallat = 48.8488722;
        var finallng = 2.3392335;
       $scope.calcRoute(finallat,finallng)


        function jsonSyncLoad( pFile ) {
            var mime      =    "application/json"   ;
            var xmlhttp   =   new XMLHttpRequest()  ;

            xmlhttp.open("GET",pFile,false);
            if (xmlhttp.overrideMimeType)
                xmlhttp.overrideMimeType( mime );

            xmlhttp.send();
            return (xmlhttp.status==200) ? JSON.parse( xmlhttp.responseText ) : null ;
        }

        $scope.openInfoWindow = function(e, selectedMarker){
            e.preventDefault();
            google.maps.event.trigger(selectedMarker, 'click');
        }


    //});
}]);

