import { Component } from '../js_web_comp_lib/Component';
import { CSS } from '../Css';
import { Map, TileLayer, Marker, LeafletEventHandlerFn, LeafletMouseEvent } from 'leaflet';
//import { Map, RasterDemSource, Layer, RasterSource, Marker, GeoJSONSource } from 'mapbox-gl';
import * as L from 'leaflet';
import { GeoJSON, LineString, FeatureCollection, Feature, Geometry } from 'geojson';
import '../lib/components/HanburgerMenuAutoHide';
import { ContextEventResult } from '../lib/components/HanburgerMenuAutoHide';
import '../lib/components/ContextMenuProgrammatical';
import { ContextMenuProgrammatical } from '../lib/components/ContextMenuProgrammatical';
import '../lib/components/MidiWindow';
import { MAP_MAIN_COMPLETE_DIRECTIONS, MAP_MAIN_SET_CENTER, MAP_MAIN_DELETE_ALL_MARKERS, RedMapMain, MAP_MAIN_OPEN_GPX_FILE, MAP_MAIN_SAVE_GPX_FILE, MAP_MAIN_SET_DIRECTIONS, MAP_MAIN_ADD_MARKER, MAP_MAIN_DELETE_MARKER, MAP_MAIN_CHANGE_MARKER } from '../reducers/RedMapMain';
import { reduxStoreInstance } from '../ReduxStore';
import { DirectionsImpl } from '../GIS/Directions';
import { FeatureCollectionImpl } from '../GIS/FeatureCollection'
import './TrailProfil';
import { GISUtil } from '../GIS/GISUtil';
import { CachedTileLayer } from '../GIS/leaflet/CachedTileLayer';
import { Overpass } from '../GIS/Overpass';
import { IMarker } from '../GIS/Marker';
import { FileDialog, FileDialogResult } from '../lib/components/FileDialog'
import '../lib/components/FileDialog';
import * as GEO from 'leaflet-control-geocoder'






const ACCESS_TOKEN = 'pk.eyJ1IjoidWlkMDEwODkiLCJhIjoiY2p6M295MGs2MDVkMDNwb2N5MHljNGFnZiJ9.QLijbhXZfDLxNfIEsBk9Xw';



class LeafMapMain extends Component {



    markers: Array<Marker>;
    geojson: FeatureCollection;
    map: Map;
    _reducer: RedMapMain;
    reduxListenerUnsubsribe: Function;
    private mapBoxUtil: GISUtil;
    geoJsonLayer: L.GeoJSON<any>;
    waymarkedtrails: TileLayer;
    showHikingLayer: boolean;

    constructor() {
        super();

        this.markers = new Array();
        this._reducer = new RedMapMain();
        reduxStoreInstance.registerReducer(this._reducer);
        this.reduxListenerUnsubsribe = reduxStoreInstance.subscribe(() => this.reduxtrigger(reduxStoreInstance));
        this.mapBoxUtil = new GISUtil(ACCESS_TOKEN);

        L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images/';

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

        this.geoJsonLayer = L.geoJSON(geojson);

        this.waymarkedtrails = new TileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
        });

        this.showHikingLayer = false;




    }

    connectedCallback() {
        super.connectedCallback();
        console.log('MapMainWindow.');
        let mapElement = this.shadowRoot.getElementById("map") as HTMLElement;

        this.map = new Map(mapElement, {});




        // set the position and zoom level of the map
        this.map.setView([49.317390, 12.035533], 9);

        var bounds = this.map.getBounds();

        // create a tileLayer with the tiles, attribution
        var opentopomap = new CachedTileLayer('https://opentopomap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
        });

        // add the tile layer to the map
        opentopomap.addTo(this.map);
        //this.waymarkedtrails.addTo(this.map);
        this.geoJsonLayer.addTo(this.map);

        // https://maps.dwd.de/geoserver/web/wicket/bookmarkable/org.geoserver.web.demo.MapPreviewPage?0
        var satelitte = new TileLayer.WMS("https://maps.dwd.de/geoserver/dwd/wms?", {
            layers: "dwd:SAT_WELT_KOMPOSIT",
            format: 'image/png',
            transparent: true,
            attribution: "Weather data © 2012 IEM Nexrad"
        });

        //satelitte.addTo(this.map);

        // https://maps.dwd.de/geoserver/web/wicket/bookmarkable/org.geoserver.web.demo.MapPreviewPage?0
        var radar = new TileLayer.WMS("https://maps.dwd.de/geoserver/dwd/wms?", {
            layers: "dwd:FX-Produkt",
            format: 'image/png',
            transparent: true,
            attribution: "Weather data © 2012 IEM Nexrad"
        });

        //radar.addTo(this.map);

        var parkingLayer = new Overpass(12, './resources/marker-icon-park.png', 'amenity=parking');
        //overpass.addTo(this.map);

        var alpine_hut = new Overpass(12, './resources/marker-icon-park.png', 'tourism=alpine_hut');

        var wilderness_hut = new Overpass(12, './resources/marker-icon-park.png', 'tourism=wilderness_hut');

        var guest_house = new Overpass(12, './resources/marker-icon-park.png', 'tourism=guest_house');

        var overlayPane = {
            "Hiking": this.waymarkedtrails,
            "Satelitte": satelitte,
            "Radar": radar,
            "Parking": parkingLayer,
            "Hütte": alpine_hut,
            "Hütte1": wilderness_hut,
            "Gästehaus": guest_house,
        };

        // Add a layer control element to the map
        var layerControl = L.control.layers(null, overlayPane);
        layerControl.addTo(this.map);

        //L.control.geocoder().addTo(this.map);





        this.map.on('click', (e) => {
            var event = e as LeafletMouseEvent
            var marker = new Marker(event.latlng, {
                draggable: true
            });

            marker.on('dragend', (e) => {
                //this.retrieveRoute();
                this._reducer.changeMarker(this.markers.indexOf(marker), { lonLatEle: [marker.getLatLng().lng, marker.getLatLng().lat] } as IMarker);
            });

            // Add it to the marker collection
            this.markers.push(marker);
            this._reducer.addMarker({ lonLatEle: [marker.getLatLng().lng, marker.getLatLng().lat] } as IMarker);


            marker.addTo(this.map);

            marker.getElement().addEventListener('contextmenu', (ev) => {

                let context = this.shadowRoot.getElementById("contextMenuMarker") as ContextMenuProgrammatical;
                context.showMenuAndRegisterEvents(ev, marker);
            });

        });


    }

    registerCallBack() {




        let contextHamburgerMenu = this.shadowRoot.getElementById("hamburgerMenu");
        contextHamburgerMenu.addEventListener('valueSelected', (e: CustomEvent) => {
            var details: ContextEventResult = e.detail;

            console.log(details);

            switch (details.command) {
                case 'open':

                    let fileDialog = this.shadowRoot.getElementById("OpenGpxFileDialog") as FileDialog;
                    fileDialog.show((files) => {
                        this._reducer.openGpxFile(files);
                    });

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


                    if (!this.showHikingLayer) {
                        this.map.addLayer(this.waymarkedtrails);
                        this.showHikingLayer = true;
                    } else {
                        this.map.removeLayer(this.waymarkedtrails);
                        this.showHikingLayer = false;
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
                    this._reducer.deleteMarker(index, { lonLatEle: [marker.getLatLng().lng, marker.getLatLng().lat] } as IMarker);

                    var index = this.markers.indexOf(details.ident);
                    if (index > -1) {
                        (details.ident as Marker).remove();
                        this.markers.splice(index, 1);
                        //this.retrieveRoute();
                    }
                    break;
                case 'move':


                    break;

                default:
                    break;
            }


        });
    }

    getHTML() {

        return Component.html` 
        ${CSS}

        <link rel="stylesheet" href="../../node_modules/leaflet/dist/leaflet.css">
        
        <style>
            body { margin:0; padding:0; }
            #map { position:absolute; top:0; bottom:0; width:100%; z-index: 0;}
        </style>


        <div id='map'></div>

        <!-- Hamburger menu -->
        <hamburger-menu-hide menu-entries={"Open%20gpx-file":"open","Save%20as%20gpx-file":"save","Delete%20all%20markers":"delAllMarkers","Switch%20on/off%20autoroute":"toggleAutoRoute","Switch%20on/off%20hiking%20tracks":"toggleHikingTracks"} ident="" id="hamburgerMenu"></hamburger-menu-hide>
        
        <!-- Context menu for the markers -->
        <context-menu-programmatical menu-entries={"Move":"move","Delete":"delete"}  id="contextMenuMarker"></context-menu-programmatical>

        <midi-window title="Profil">
            <trail-profil></trail-profil>
        </midi-window>

        <file-dialog id="OpenGpxFileDialog"></file-dialog>

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
                this.geoJsonLayer.clearLayers();
                this.geoJsonLayer.addData(FeatureCollectionImpl.getFeatureCollection(directions));

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
                this.map.flyTo([storeInstance.getState().center[1], storeInstance.getState().center[0]], 9);

                break;

            default:
                break;
        }
    }




}
window.customElements.define('leaf-map-main', LeafMapMain);

export { LeafMapMain };

