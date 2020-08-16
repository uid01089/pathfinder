import { Component } from '../js_web_comp_lib/Component';
import { CSS } from '../Css';
import { Map, TileLayer, Layer, Marker, LeafletEventHandlerFn, LeafletMouseEvent } from 'leaflet';
import { LayerStack } from '../GIS/leaflet/LayerStack';
//import { Map, RasterDemSource, Layer, RasterSource, Marker, GeoJSONSource } from 'mapbox-gl';
import * as L from 'leaflet';
import { GeoJSON, LineString, FeatureCollection, Feature, Geometry } from 'geojson';
import '../js_lib/components/HanburgerMenuAutoHide';
import '../js_lib/components/HamburgerMenuTree';
import { ContextEventResult } from '../js_lib/components/HanburgerMenuAutoHide';
import '../js_lib/components/ContextMenuProgrammatical';
import { ContextMenuProgrammatical } from '../js_lib/components/ContextMenuProgrammatical';
import '../js_lib/components/MidiWindow';
import { MAP_MAIN_COMPLETE_DIRECTIONS, MAP_MAIN_SET_CENTER, MAP_MAIN_DELETE_ALL_MARKERS, RedMapMain, MAP_MAIN_OPEN_GPX_FILE, MAP_MAIN_SAVE_GPX_FILE, MAP_MAIN_SET_DIRECTIONS, MAP_MAIN_ADD_MARKER, MAP_MAIN_DELETE_MARKER, MAP_MAIN_CHANGE_MARKER } from '../reducers/RedMapMain';
import { reduxStoreInstance, State } from '../ReduxStore';
import { DirectionsImpl } from '../GIS/Directions';
import { FeatureCollectionImpl } from '../GIS/FeatureCollection'
import './TrailProfil';
import { GISUtil } from '../GIS/GISUtil';
import { CachedTileLayer } from '../GIS/leaflet/CachedTileLayer';
import { Overpass } from '../GIS/Overpass';
import { IMarker } from '../GIS/Marker';
import { FileDialog, FileDialogResult } from '../js_lib/components/FileDialog'
import '../js_lib/components/FileDialog';
import * as GEO from 'leaflet-control-geocoder';
import { LeafletCss } from './Leaflet.css';
import { MidiWindow } from '../js_lib/components/MidiWindow';
import { Landscape3d } from './Landscape3d';
import './Landscape3d';




import { BoundingBox } from '../GIS/BoundingBox';
import { HamburgerMenuTree } from '../js_lib/components/HamburgerMenuTree';
import { CT_Config, CT_Button, CT_Selection, CT_Switch, ContextMenuTreeEventResult } from '../js_lib/components/ContextMenuTree';


import './Impressum';
import { ReduxComponent } from '../js_web_comp_lib/ReduxComponent';
import { AbstractReduxStore } from '../js_web_comp_lib/AbstractReduxStore';







const ACCESS_TOKEN = 'pk.eyJ1IjoidWlkMDEwODkiLCJhIjoiY2p6M295MGs2MDVkMDNwb2N5MHljNGFnZiJ9.QLijbhXZfDLxNfIEsBk9Xw';



class LeafMapMain extends ReduxComponent<State> {



	markers: Array<Marker>;
	map: Map;
	reducer: RedMapMain;
	private mapBoxUtil: GISUtil;
	geoJsonLayer: L.GeoJSON<any>;
	waymarkedtrailsHiking: TileLayer;
	featureCollection: FeatureCollectionImpl;
	clouds: TileLayer.WMS;
	rainRadar: TileLayer.WMS;
	parkingLayer: Overpass;
	alpine_hut: Overpass;
	wilderness_hut: Overpass;
	guest_house: Overpass;
	openTopoMap: CachedTileLayer;
	mapboxSat: CachedTileLayer;
	openStreetMap: CachedTileLayer;
	bayernnetz_fuer_radler: TileLayer.WMS;
	fernradwanderwege: TileLayer.WMS;
	mountainbikewege: TileLayer.WMS;
	radwanderwege: TileLayer.WMS;
	wanderwege: TileLayer.WMS;
	oertliche_wanderwege: TileLayer.WMS;
	fernwanderwege: TileLayer.WMS;
	waymarkedtrailsCycling: TileLayer;
	waymarkedtrailsRiding: TileLayer;
	layerStack: LayerStack<Layer>;
	googleSatMap: CachedTileLayer;
	googleHybMap: CachedTileLayer;

	constructor() {

		const reducer = new RedMapMain();
		super(reducer, reduxStoreInstance);
		this.reducer = reducer;

		this.markers = [];
		this.mapBoxUtil = new GISUtil(ACCESS_TOKEN);

		L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images/';

		const geojson: FeatureCollection = {
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

		this.featureCollection = FeatureCollectionImpl.getFeatureCollection();

		this.geoJsonLayer = L.geoJSON(geojson);








	}

	connectedCallback(): void {
		super.connectedCallback();
		console.log('MapMainWindow.');
		const mapElement = this.shadowRoot.getElementById("map") as HTMLElement;

		this.map = new Map(mapElement, {});

		this.layerStack = new LayerStack({
			addLayerOperation: (layer) => {
				this.map.addLayer(layer);
			}, removeLayerOperation: (layer) => {
				this.map.removeLayer(layer)
			}, updateFinishedOperation: null
		});



		// set the position and zoom level of the map
		this.map.setView([49.317390, 12.035533], 9);



		// create a tileLayer with the tiles, attribution


		this.openTopoMap = new CachedTileLayer('https://opentopomap.org/{z}/{x}/{y}.png', {
			maxZoom: 18,
			attribution: '<a href="http://opentopomap.org">opentopomap.org</a>'
		});
		this.layerStack.addLayer(this.openTopoMap);
		this.layerStack.showLayer(this.openTopoMap, true);



		this.openStreetMap = new CachedTileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 18,
			attribution: '<a href="http://openstreetmap.org">openstreetmap.org</a>'
		});
		this.layerStack.addLayer(this.openStreetMap);


		//https://baumsicht.de/google-maps-ohne-plugin-in-qgis-verwenden/
		this.googleSatMap = new CachedTileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
			maxZoom: 18,
			attribution: '<a href="http://google.com">google.com</a>'
		});
		this.layerStack.addLayer(this.googleSatMap);

		//https://baumsicht.de/google-maps-ohne-plugin-in-qgis-verwenden/
		this.googleHybMap = new CachedTileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
			maxZoom: 18,
			attribution: '<a href="http://google.com">google.com</a>'
		});
		this.layerStack.addLayer(this.googleHybMap);


		this.mapboxSat = new CachedTileLayer('https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}{r}.webp?' + 'access_token=' + ACCESS_TOKEN, {
			maxZoom: 18,
			attribution: '<a href="http://mapbox.com">mapbox.com</a>'
		});
		this.layerStack.addLayer(this.mapboxSat);


		//https://geodatenonline.bayern.de/geodatenonline/seiten/wms_fzw
		this.bayernnetz_fuer_radler = new TileLayer.WMS("http://www.geodaten.bayern.de/ogc/ogc_fzw_oa.cgi?", {
			layers: "bayernnetz_fuer_radler",
			format: 'image/png',
			transparent: true,
			attribution: '<a href="https://geodatenonline.bayern.de/geodatenonline/seiten/wms_fzw">geodatenonline.bayern.de</a>'
		});
		this.layerStack.addLayer(this.bayernnetz_fuer_radler);

		//https://geodatenonline.bayern.de/geodatenonline/seiten/wms_fzw
		this.fernradwanderwege = new TileLayer.WMS("http://www.geodaten.bayern.de/ogc/ogc_fzw_oa.cgi?", {
			layers: "fernradwanderwege",
			format: 'image/png',
			transparent: true,
			attribution: '<a href="https://geodatenonline.bayern.de/geodatenonline/seiten/wms_fzw">geodatenonline.bayern.de</a>'
		});
		this.layerStack.addLayer(this.fernradwanderwege);


		//https://geodatenonline.bayern.de/geodatenonline/seiten/wms_fzw
		this.mountainbikewege = new TileLayer.WMS("http://www.geodaten.bayern.de/ogc/ogc_fzw_oa.cgi?", {
			layers: "mountainbikewege",
			format: 'image/png',
			transparent: true,
			attribution: '<a href="https://geodatenonline.bayern.de/geodatenonline/seiten/wms_fzw">geodatenonline.bayern.de</a>'
		});
		this.layerStack.addLayer(this.mountainbikewege);

		//https://geodatenonline.bayern.de/geodatenonline/seiten/wms_fzw
		this.radwanderwege = new TileLayer.WMS("http://www.geodaten.bayern.de/ogc/ogc_fzw_oa.cgi?", {
			layers: "radwanderwege",
			format: 'image/png',
			transparent: true,
			attribution: '<a href="https://geodatenonline.bayern.de/geodatenonline/seiten/wms_fzw">geodatenonline.bayern.de</a>'
		});
		this.layerStack.addLayer(this.radwanderwege);

		//https://geodatenonline.bayern.de/geodatenonline/seiten/wms_fzw
		this.wanderwege = new TileLayer.WMS("http://www.geodaten.bayern.de/ogc/ogc_fzw_oa.cgi?", {
			layers: "wanderwege",
			format: 'image/png',
			transparent: true,
			attribution: '<a href="https://geodatenonline.bayern.de/geodatenonline/seiten/wms_fzw">geodatenonline.bayern.de</a>'
		});
		this.layerStack.addLayer(this.wanderwege);

		//https://geodatenonline.bayern.de/geodatenonline/seiten/wms_fzw
		this.fernwanderwege = new TileLayer.WMS("http://www.geodaten.bayern.de/ogc/ogc_fzw_oa.cgi?", {
			layers: "fernwanderwege",
			format: 'image/png',
			transparent: true,
			attribution: '<a href="https://geodatenonline.bayern.de/geodatenonline/seiten/wms_fzw">geodatenonline.bayern.de</a>'
		});
		this.layerStack.addLayer(this.fernwanderwege);

		//https://geodatenonline.bayern.de/geodatenonline/seiten/wms_fzw
		this.oertliche_wanderwege = new TileLayer.WMS("http://www.geodaten.bayern.de/ogc/ogc_fzw_oa.cgi?", {
			layers: "oertliche_wanderwege",
			format: 'image/png',
			transparent: true,
			attribution: '<a href="https://geodatenonline.bayern.de/geodatenonline/seiten/wms_fzw">geodatenonline.bayern.de</a>'
		});
		this.layerStack.addLayer(this.oertliche_wanderwege);


		this.waymarkedtrailsHiking = new TileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
			maxZoom: 18,
			attribution: '<a href="https://hiking.waymarkedtrails.org/help/legal">waymarkedtrails.org</a>'
		});
		this.layerStack.addLayer(this.waymarkedtrailsHiking);

		this.waymarkedtrailsCycling = new TileLayer('https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png', {
			maxZoom: 18,
			attribution: '<a href="https://hiking.waymarkedtrails.org/help/legal">waymarkedtrails.org</a>'
		});
		this.layerStack.addLayer(this.waymarkedtrailsCycling);

		this.waymarkedtrailsRiding = new TileLayer('https://tile.waymarkedtrails.org/riding/{z}/{x}/{y}.png', {
			maxZoom: 18,
			attribution: '<a href="https://hiking.waymarkedtrails.org/help/legal">waymarkedtrails.org</a>'
		});
		this.layerStack.addLayer(this.waymarkedtrailsRiding);




		//this.waymarkedtrails.addTo(this.map);
		//this.geoJsonLayer.addTo(this.map);
		this.layerStack.addLayer(this.geoJsonLayer);
		this.layerStack.showLayer(this.geoJsonLayer, true);

		// https://maps.dwd.de/geoserver/web/wicket/bookmarkable/org.geoserver.web.demo.MapPreviewPage?0
		this.clouds = new TileLayer.WMS("https://maps.dwd.de/geoserver/dwd/wms?", {
			layers: "dwd:SAT_WELT_KOMPOSIT",
			format: 'image/png',
			transparent: true,
			attribution: '<a href="https://maps.dwd.de/geoserver/web/">DWD-SAT_WELT_KOMPOSIT</a>'
		});
		this.layerStack.addLayer(this.clouds);

		//satelitte.addTo(this.map);

		// https://maps.dwd.de/geoserver/web/wicket/bookmarkable/org.geoserver.web.demo.MapPreviewPage?0
		this.rainRadar = new TileLayer.WMS("https://maps.dwd.de/geoserver/dwd/wms?", {
			layers: "dwd:FX-Produkt",
			format: 'image/png',
			transparent: true,
			attribution: '<a href="https://maps.dwd.de/geoserver/web/">DWD-FX-Produkt</a>'
		});
		this.layerStack.addLayer(this.rainRadar);


		this.parkingLayer = new Overpass(12, './resources/marker-icon-park.png', 'amenity=parking');
		this.layerStack.addLayer(this.parkingLayer);

		this.alpine_hut = new Overpass(12, './resources/marker-icon-park.png', 'tourism=alpine_hut');
		this.layerStack.addLayer(this.alpine_hut);

		this.wilderness_hut = new Overpass(12, './resources/marker-icon-park.png', 'tourism=wilderness_hut');
		this.layerStack.addLayer(this.wilderness_hut);

		this.guest_house = new Overpass(12, './resources/marker-icon-park.png', 'tourism=guest_house');
		this.layerStack.addLayer(this.guest_house);

		L.control.scale().addTo(this.map);




		this.map.on('click', (e) => {
			const event = e as LeafletMouseEvent
			const marker = new Marker(event.latlng, {
				draggable: true
			});

			marker.on('dragend', (e) => {
				//this.retrieveRoute();
				this.reducer.changeMarker(this.markers.indexOf(marker), { lonLatEle: { longitude: marker.getLatLng().lng, latitude: marker.getLatLng().lat } } as IMarker, this.map.getZoom());
			});

			// Add it to the marker collection
			this.markers.push(marker);
			this.reducer.addMarker({ lonLatEle: { longitude: marker.getLatLng().lng, latitude: marker.getLatLng().lat } } as IMarker, this.map.getZoom());


			marker.addTo(this.map);

			marker.getElement().addEventListener('contextmenu', (ev) => {

				const context = this.shadowRoot.getElementById("contextMenuMarker") as ContextMenuProgrammatical;
				context.showMenuAndRegisterEvents(ev, marker);
			});



		});


	}

	registerCallBack(): void {

		const profileWindow = this.shadowRoot.getElementById("ProfileWindow") as MidiWindow;
		profileWindow.hide();

		const impressumWindow = this.shadowRoot.getElementById("Impressum") as MidiWindow;
		impressumWindow.hide();

		const landscapeWindow3d = this.shadowRoot.getElementById("3DLandscape") as MidiWindow;
		landscapeWindow3d.hide();
		const landscapeWindow3dContent = this.shadowRoot.getElementById("3DLandscapeContent") as Landscape3d;



		const contextHamburgerMenu = this.shadowRoot.getElementById("hamburgerMenu") as HamburgerMenuTree;



		const config: CT_Config = {
			nodes: [
				{
					name: "File operations",
					nodes: [],
					leafs:
						[
							{ name: "Open GPX file" } as CT_Button,
							{ name: "Save GPX file" } as CT_Button
						]
				},
				{
					name: "Layers",
					nodes: [
						{
							name: "Geodaten-online",
							nodes: [],
							leafs:
								[
									{ name: "bayernnetz_fuer_radler", value: false } as CT_Switch,
									{ name: "fernradwanderwege", value: false } as CT_Switch,
									{ name: "fernwanderwege", value: false } as CT_Switch,
									{ name: "mountainbikewege", value: false } as CT_Switch,
									{ name: "radwanderwege", value: false } as CT_Switch,
									{ name: "wanderwege", value: false } as CT_Switch,
									{ name: "oertliche_wanderwege", value: false } as CT_Switch,
								]
						},
						{
							name: "DWD",
							nodes: [],
							leafs:
								[
									{ name: "Clouds", value: false } as CT_Switch,
									{ name: "Raining", value: false } as CT_Switch,
								]
						},
						{
							name: "waymarkedtrails",
							nodes: [],
							leafs:
								[
									{ name: "Hiking tracks", value: false } as CT_Switch,
									{ name: "Cycling tracks", value: false } as CT_Switch,
									{ name: "Riding tracks", value: false } as CT_Switch,

								]
						},



					],
					leafs:
						[
							{ name: "Map", value: "TopoMap", valueCollection: ["TopoMap", "OpenStreetMap", "Mapbox Satellite", "Google Satellite", "Google Hyprid"] } as CT_Selection,
							{ name: "Parking", value: false } as CT_Switch,
							{ name: "Alpin Hut", value: false } as CT_Switch,
							{ name: "Wilderness Hut", value: false } as CT_Switch,
							{ name: "Guest House", value: false } as CT_Switch
						]
				},
				{
					name: "Routing",
					nodes: [],
					leafs:
						[
							{ name: "Delete all markers" } as CT_Button,
							{ name: "Automatic routing", value: false } as CT_Switch
						]
				},
				{
					name: "Utility",
					nodes: [],
					leafs:
						[
							{ name: "Show Profile" } as CT_Button,
							{ name: "Show 3d-Graphic" } as CT_Button
						]
				}],
			leafs: [
				{ name: "Impressum" } as CT_Button

			]
		};

		contextHamburgerMenu.setConfig(config);


		contextHamburgerMenu.addEventListener('valueSelected', (e: CustomEvent) => {
			const details: ContextMenuTreeEventResult = e.detail;

			console.log(details.path);

			switch (details.path) {
				case '/File operations/Open GPX file':
					{
						const fileDialog = this.shadowRoot.getElementById("OpenGpxFileDialog") as FileDialog;
						fileDialog.show((files) => {
							this.reducer.openGpxFile(files, this.map.getZoom());
						});
					}

					break;
				case '/File operations/Save GPX file':
					{
						const fileName = prompt("Name of the file?", "route.gpx");
						if (null != fileName) {
							const iMarkers: IMarker[] = [];
							this.markers.forEach((marker) => {
								iMarkers.push({ lonLatEle: { latitude: marker.getLatLng().lat, longitude: marker.getLatLng().lng, elevation: marker.getLatLng().alt } });
							})
							this.reducer.saveGpxFile(fileName, iMarkers);

						}


					}


					break;
				case '/Routing/Delete all markers':
					this.reducer.delAllMarkers(this.map.getZoom());
					break;
				case '/Routing/Automatic routing':
					this.reducer.toggleAutoRoute(details.value as boolean, this.map.getZoom());
					break;
				case '/Layers/waymarkedtrails/Hiking tracks':
					this.layerStack.showLayer(this.waymarkedtrailsHiking, details.value as boolean);

					break;
				case '/Layers/waymarkedtrails/Cycling tracks':
					this.layerStack.showLayer(this.waymarkedtrailsCycling, details.value as boolean);
					break;
				case '/Layers/waymarkedtrails/Riding tracks':
					this.layerStack.showLayer(this.waymarkedtrailsRiding, details.value as boolean);

					break;
				case '/Layers/DWD/Clouds':
					this.layerStack.showLayer(this.clouds, details.value as boolean);

					break;
				case '/Layers/DWD/Raining':
					this.layerStack.showLayer(this.rainRadar, details.value as boolean);

					break;
				case '/Layers/Parking':
					this.layerStack.showLayer(this.parkingLayer, details.value as boolean);

					break;
				case '/Layers/Geodaten-online/bayernnetz_fuer_radler':
					this.layerStack.showLayer(this.bayernnetz_fuer_radler, details.value as boolean);

					break;
				case '/Layers/Geodaten-online/fernradwanderwege':
					this.layerStack.showLayer(this.fernradwanderwege, details.value as boolean);

					break;
				case '/Layers/Geodaten-online/fernwanderwege':
					this.layerStack.showLayer(this.fernwanderwege, details.value as boolean);

					break;
				case '/Layers/Geodaten-online/mountainbikewege':
					this.layerStack.showLayer(this.mountainbikewege, details.value as boolean);

					break;
				case '/Layers/Geodaten-online/radwanderwege':
					this.layerStack.showLayer(this.radwanderwege, details.value as boolean);

					break;
				case '/Layers/Geodaten-online/wanderwege':
					this.layerStack.showLayer(this.wanderwege, details.value as boolean);

					break;
				case '/Layers/Geodaten-online/oertliche_wanderwege':
					this.layerStack.showLayer(this.oertliche_wanderwege, details.value as boolean);

					break;
				case '/Layers/Map':
					{
						switch (details.value) {
							case "TopoMap":
								{
									this.layerStack.showLayer(this.openTopoMap, true);
									this.layerStack.showLayer(this.openStreetMap, false);
									this.layerStack.showLayer(this.mapboxSat, false);
									this.layerStack.showLayer(this.googleHybMap, false);
									this.layerStack.showLayer(this.googleSatMap, false);
								}
								break;
							case "Mapbox Satellite":
								{
									this.layerStack.showLayer(this.openTopoMap, false);
									this.layerStack.showLayer(this.openStreetMap, false);
									this.layerStack.showLayer(this.mapboxSat, true);
									this.layerStack.showLayer(this.googleHybMap, false);
									this.layerStack.showLayer(this.googleSatMap, false);
								}
								break;
							case "OpenStreetMap":
								{
									this.layerStack.showLayer(this.openTopoMap, false);
									this.layerStack.showLayer(this.openStreetMap, true);
									this.layerStack.showLayer(this.mapboxSat, false);
									this.layerStack.showLayer(this.googleHybMap, false);
									this.layerStack.showLayer(this.googleSatMap, false);
								}
								break;
							case "Google Satellite":
								{
									this.layerStack.showLayer(this.openTopoMap, false);
									this.layerStack.showLayer(this.openStreetMap, false);
									this.layerStack.showLayer(this.mapboxSat, false);
									this.layerStack.showLayer(this.googleHybMap, false);
									this.layerStack.showLayer(this.googleSatMap, true);
								}
								break;
							case "Google Hyprid":
								{
									this.layerStack.showLayer(this.openTopoMap, false);
									this.layerStack.showLayer(this.openStreetMap, false);
									this.layerStack.showLayer(this.mapboxSat, false);
									this.layerStack.showLayer(this.googleHybMap, true);
									this.layerStack.showLayer(this.googleSatMap, false);
								}
								break;
						}
					}
					break;
				case '/Layers/Alpin Hut':
					this.layerStack.showLayer(this.alpine_hut, details.value as boolean);

					break;
				case '/Layers/Wilderness Hut':
					this.layerStack.showLayer(this.wilderness_hut, details.value as boolean);

					break;
				case '/Layers/Guest House':
					this.layerStack.showLayer(this.guest_house, details.value as boolean);

					break;
				case '/Utility/Show Profile':
					profileWindow.show();
					break;

				case '/Utility/Show 3d-Graphic':
					{
						const bounds = this.map.getBounds();
						bounds.getSouthWest().lng
						const boundingBox = new BoundingBox(bounds.getSouthWest().lng, bounds.getSouthWest().lat, bounds.getNorthEast().lng, bounds.getNorthEast().lat)
						landscapeWindow3d.show();

						landscapeWindow3dContent.show(boundingBox, this.featureCollection, this.map.getZoom());

					}
					break;
				case '/Impressum':
					{
						impressumWindow.show();
					}
					break;


				default:
					break;
			}
		});

		const contextMarkerMenu = this.shadowRoot.getElementById("contextMenuMarker");
		contextMarkerMenu.addEventListener('valueSelected', (e: CustomEvent) => {
			const details: ContextEventResult = e.detail;

			switch (details.command) {
				case 'delete':
					{
						const marker: Marker = details.ident;

						const index = this.markers.indexOf(details.ident);
						this.reducer.deleteMarker(index, { lonLatEle: { longitude: marker.getLatLng().lng, latitude: marker.getLatLng().lat } } as IMarker, this.map.getZoom());


						if (index > -1) {
							(details.ident as Marker).remove();
							this.markers.splice(index, 1);
							//this.retrieveRoute();
						}
					}
					break;
				case 'move':


					break;

				default:
					break;
			}


		});


	}

	getHTML(): string {




		return Component.html` 
        
        ${CSS}

		<!--link rel="stylesheet" href="../../node_modules/leaflet/dist/leaflet.css"-->
		${LeafletCss}

        <style>
            
            
            body { margin:0; padding:0; }
            #map { position:absolute; top:0; bottom:0; width:100%; z-index: 0;}
        </style>


        <div id='map'></div>

        <!-- Hamburger menu -->
        <hamburger-menu-tree  id="hamburgerMenu"></hamburger-menu-tree>
        
        <!-- Context menu for the markers -->
        <context-menu-programmatical menu-entries={"Move":"move","Delete":"delete"}  id="contextMenuMarker"></context-menu-programmatical>

        <midi-window id='ProfileWindow', title="Profil">
            <trail-profil slot='content'></trail-profil>
        </midi-window>

		
		<midi-window id='3DLandscape', title="3DLandscape">
            <three-landscape-element slot='content' id='3DLandscapeContent'></three-landscape-element>
        </midi-window>

		<!--midi-window id='3DLandscape', title="3DLandscape">
            <three-landscape-shpere-element slot='content' id='3DLandscapeContent'></three-landscape-shpere-element>
        </midi-window-->

		<midi-window id='Impressum', title="Impressum">
            <impressum-element slot='content' id='ImpressumContent'></impressum-element>
        </midi-window>


        <file-dialog id="OpenGpxFileDialog"></file-dialog>

        `;
	}


	/**
	  * This operation is called by Redux
	  * @param reduxStore 
	  */
	triggeredFromRedux(reduxStore: AbstractReduxStore<State>): void {

		super.triggeredFromRedux(reduxStore);

		switch (reduxStore.getState().action) {

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
				{
					console.log("- set directions");
					const directions: DirectionsImpl = reduxStore.getState().directions;
					// then update the map
					this.geoJsonLayer.clearLayers();
					this.geoJsonLayer.addData(FeatureCollectionImpl.getFeatureCollection(directions));


					this.featureCollection = FeatureCollectionImpl.getFeatureCollection(directions);
				}
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
				this.map.flyTo([reduxStore.getState().center[1], reduxStore.getState().center[0]], 9);

				break;

			default:
				break;
		}
	}




}
window.customElements.define('leaf-map-main', LeafMapMain);

export { LeafMapMain, ACCESS_TOKEN };

