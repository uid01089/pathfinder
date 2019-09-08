//import { LitElement, html } from '@polymer/lit-element';
import { Component } from '../lib/Component';
import { CSS } from '../Css';
import { Map, RasterDemSource, Layer, RasterSource, Marker, GeoJSONSource } from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import * as mapbox from 'mapbox-gl';
import { GeoJSON, LineString, FeatureCollection, Feature, Geometry } from 'geojson';
import '../lib/components/HanburgerMenuAutoHide';
import { ContextEventResult } from '../lib/components/HanburgerMenuAutoHide';
import '../lib/components/ContextMenuProgrammatical';
import { ContextMenuProgrammatical } from '../lib/components/ContextMenuProgrammatical';
import '../lib/components/MidiWindow';
import { MAP_MAIN_COMPLETE_DIRECTIONS, MAP_MAIN_SET_CENTER, MAP_MAIN_DELETE_ALL_MARKERS, RedMapMain, MAP_MAIN_OPEN_GPX_FILE, MAP_MAIN_SAVE_GPX_FILE, MAP_MAIN_SET_DIRECTIONS, MAP_MAIN_ADD_MARKER, MAP_MAIN_DELETE_MARKER, MAP_MAIN_CHANGE_MARKER } from '../reducers/RedMapMain';
import { reduxStoreInstance } from '../ReduxStore';
import { DirectionsImpl } from '../lib/MapBox/Directions';
import { FeatureCollectionImpl } from '../lib/MapBox/FeatureCollection'
import './TrailProfil';
import { MapBoxUtil, IMarker } from '../lib/MapBox/MapBoxUtil';



const ACCESS_TOKEN = 'pk.eyJ1IjoidWlkMDEwODkiLCJhIjoiY2p6M295MGs2MDVkMDNwb2N5MHljNGFnZiJ9.QLijbhXZfDLxNfIEsBk9Xw';



class MapMainElement extends Component {



    markers: Array<Marker>;
    geojson: FeatureCollection;
    map: Map;
    _reducer: RedMapMain;
    reduxListenerUnsubsribe: Function;
    private mapBoxUtil: MapBoxUtil;

    constructor() {
        super();

        this.markers = new Array();
        this._reducer = new RedMapMain();
        reduxStoreInstance.registerReducer(this._reducer);
        this.reduxListenerUnsubsribe = reduxStoreInstance.subscribe(() => this.reduxtrigger(reduxStoreInstance));
        this.mapBoxUtil = new MapBoxUtil(ACCESS_TOKEN);




        // Long search but this workaround was found on https://stackoverflow.com/questions/44332290/mapbox-gl-typing-wont-allow-accesstoken-assignment
        Object.getOwnPropertyDescriptor(mapbox, "accessToken").set(ACCESS_TOKEN);


    }

    connectedCallback() {
        super.connectedCallback();
        console.log('MapMainWindow.');
        let mapElement = this.shadowRoot.getElementById("map") as Element;

        this.map = new Map({
            container: mapElement, // container id
            //style: 'mapbox://styles/mapbox/cjaudgl840gn32rnrepcb9b9g', // stylesheet location

            style: {
                "version": 8,
                "sources": {
                    "topo-map": {
                        "type": "raster",
                        "tiles": ["https://opentopomap.org/{z}/{x}/{y}.png"],
                        "tileSize": 256,
                    }
                },
                "layers": [{
                    "id": "topo-map",
                    "type": "raster",
                    "source": "topo-map",
                    "minzoom": 0,
                    "maxzoom": 22
                }]
            },




            center: [12.035533, 49.317390], // starting position [lng, lat]
            zoom: 9 // starting zoom
        });

        this.map.on('load', () => {


            this.map.addSource('topomap', {
                "type": "raster",
                "tiles": ["https://opentopomap.org/{z}/{x}/{y}.png"],
                "tileSize": 256
            } as RasterSource);


            this.map.addSource('trails', {
                "type": "raster",
                "tiles": ["https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png"],
                "tileSize": 256
            } as RasterSource);


            this.map.addLayer({
                "id": "trails",
                "source": "trails",
                "type": "raster"
            } as Layer);



            this.map.setLayoutProperty("trails", 'visibility', 'none');



            var geojson: FeatureCollection = {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [0, 0]
                        ]
                    }
                } as Feature]
            };

            this.map.addLayer({
                'id': 'line-animation',
                'type': 'line',
                'source': {
                    'type': 'geojson',
                    'data': geojson
                },
                'layout': {
                    'line-cap': 'round',
                    'line-join': 'round'
                },
                'paint': {
                    'line-color': '#ed6498',
                    'line-width': 5,
                    'line-opacity': .8
                }
            });

        });


        /*
                var geocoder = new MapboxGeocoder({
                    accessToken: ACCESS_TOKEN,
                    mapboxgl: mapbox
                });
                this.map.addControl(geocoder);
                */

        this.map.on('click', (e) => {

            let clickedLatitude = e.lngLat.lat;
            let clickedLongitude = e.lngLat.lng;

            var saftyMargin = false;

            this.markers.forEach((marker) => {
                var markerLatitutde = marker.getLngLat().lat;
                var markerLongitude = marker.getLngLat().lng;
                var zoom = this.map.getZoom();



                if ((clickedLatitude - markerLatitutde) ** 2 + (clickedLongitude - markerLongitude) ** 2 < (0.005 / zoom) ** 2) {
                    saftyMargin = true;
                }

            });

            if (!saftyMargin) {

                var marker = new Marker({
                    draggable: false
                });

                marker.setLngLat(e.lngLat)


                marker.addTo(this.map);

                marker.on('dragend', (e) => {
                    //this.retrieveRoute();
                    marker.setDraggable(false);
                    this._reducer.changeMarker(this.markers.indexOf(marker), { lonLatEle: [marker.getLngLat().lng, marker.getLngLat().lat] } as IMarker);
                });

                // Add it to the marker collection
                this.markers.push(marker);
                this._reducer.addMarker({ lonLatEle: [marker.getLngLat().lng, marker.getLngLat().lat] } as IMarker);




                marker.getElement().addEventListener('contextmenu', (ev) => {

                    // Disable dragging for all markers
                    this.markers.forEach((marker) => {
                        marker.setDraggable(false);
                    })


                    let context = this.shadowRoot.getElementById("contextMenuMarker") as ContextMenuProgrammatical;
                    context.showMenuAndRegisterEvents(ev, marker);
                });


                //this.retrieveRoute();


            }
        });

    }

    registerCallBack() {

        let contextHamburgerMenu = this.shadowRoot.getElementById("hamburgerMenu");
        contextHamburgerMenu.addEventListener('valueSelected', (e: CustomEvent) => {
            var details: ContextEventResult = e.detail;

            console.log(details);

            switch (details.command) {
                case 'open':
                    this._reducer.openGpxFile();
                    break;
                case 'save':
                    this._reducer.saveGpxFile();
                    break;
                case 'delAllMarkers':
                    this._reducer.delAllMarkers();
                    break;
                case 'toggleAutoRoute':
                    this._reducer.toggleAutoRoute();
                    break;
                case 'toggleHikingTracks':

                    var hikingTracksLayer = this.map.getLayoutProperty("trails", 'visibility');
                    if (hikingTracksLayer === 'none') {
                        this.map.setLayoutProperty("trails", 'visibility', 'visible');
                    } else {
                        this.map.setLayoutProperty("trails", 'visibility', 'none');

                    }
                    break;

                default:
                    break;
            }
        });

        let contextMarkerMenu = this.shadowRoot.getElementById("contextMenuMarker");
        contextMarkerMenu.addEventListener('valueSelected', (e: CustomEvent) => {
            var details: ContextEventResult = e.detail;

            switch (details.command) {
                case 'delete':
                    var marker: Marker = details.ident;

                    var index = this.markers.indexOf(details.ident);
                    this._reducer.deleteMarker(index, { lonLatEle: [marker.getLngLat().lng, marker.getLngLat().lat] } as IMarker);

                    var index = this.markers.indexOf(details.ident);
                    if (index > -1) {
                        (details.ident as Marker).remove();
                        this.markers.splice(index, 1);
                        //this.retrieveRoute();
                    }
                    break;
                case 'move':
                    (details.ident as Marker).setDraggable(true);

                    break;

                default:
                    break;
            }


        });
    }

    getHTML() {

        return Component.html` 
        ${CSS}

        <link rel="stylesheet" href="../../node_modules/mapbox-gl/dist/mapbox-gl.css">
        <link rel="stylesheet" href="../../node_modules/@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css">
        <style>
            body { margin:0; padding:0; }
            #map { position:absolute; top:0; bottom:0; width:100%; }
        </style>


        <div id='map'></div>

        <!-- Hamburger menu -->
        <hamburger-menu-hide menu-entries={"Open%20gpx-file":"open","Save%20as%20gpx-file":"save","Delete%20all%20markers":"delAllMarkers","Switch%20on/off%20autoroute":"toggleAutoRoute","Switch%20on/off%20hiking%20tracks":"toggleHikingTracks"} ident="" id="hamburgerMenu"></hamburger-menu-hide>
        
        <!-- Context menu for the markers -->
        <context-menu-programmatical menu-entries={"Move":"move","Delete":"delete"}  id="contextMenuMarker"></context-menu-programmatical>

        <midi-window title="Profil">
            <trail-profil></trail-profil>
        </midi-window>
        `;
    }


    reduxtrigger(storeInstance) {

        if (!this.isConnected) {
            this.reduxListenerUnsubsribe();
        }

        switch (storeInstance.getState().action) {

            case MAP_MAIN_OPEN_GPX_FILE:
                console.log("- open gpx");

                // Delete all markers. The markers are repopulated later by consecutive actions
                this.markers.forEach((marker) => {
                    marker.remove()
                })
                this.markers = [];
                break;
            case MAP_MAIN_SAVE_GPX_FILE:
                console.log("- save gpx");
                break;
            case MAP_MAIN_SET_DIRECTIONS:
                console.log("- set directions");
                var directions: DirectionsImpl = storeInstance.getState().directions;
                // then update the map
                (this.map.getSource('line-animation') as GeoJSONSource).setData(FeatureCollectionImpl.getFeatureCollection(directions));

                break;
            case MAP_MAIN_ADD_MARKER:
                console.log("- add marker");
                break;
            case MAP_MAIN_DELETE_MARKER:
                console.log("- delete marker");
                break;
            case MAP_MAIN_CHANGE_MARKER:
                console.log("- change marker");
                break;
            case MAP_MAIN_COMPLETE_DIRECTIONS:
                console.log("- complete direction");
                break;
            case MAP_MAIN_DELETE_ALL_MARKERS:
                console.log("- delete all marker");

                this.markers.forEach((marker) => {
                    marker.remove()

                })

                this.markers = [];


                break;
            case MAP_MAIN_SET_CENTER:
                console.log("- set center");
                this.map.flyTo({
                    center: storeInstance.getState().center.slice(0, 2),
                    zoom: 9,
                    speed: 0.8,
                    curve: 1,
                    easing(t) {
                        return t;
                    }
                });

                break;

            default:
                break;
        }
    }




}
window.customElements.define('map-main', MapMainElement);

export { MapMainElement };

