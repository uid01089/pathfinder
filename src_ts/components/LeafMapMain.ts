import { Component } from '../js_web_comp_lib/Component';
import { CSS } from '../Css';
import { Map, TileLayer, Marker, LeafletEventHandlerFn, LeafletMouseEvent } from 'leaflet';
//import { Map, RasterDemSource, Layer, RasterSource, Marker, GeoJSONSource } from 'mapbox-gl';
import * as L from 'leaflet';
import { GeoJSON, LineString, FeatureCollection, Feature, Geometry } from 'geojson';
import '../lib/components/HanburgerMenuAutoHide';
import '../lib/components/HamburgerMenuTree';
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
import * as GEO from 'leaflet-control-geocoder';
import { LeafletCss } from './Leaflet.css';
import { MidiWindow } from '../lib/components/MidiWindow';
import { Landscape3d } from './Landscape3d';
import './Landscape3d';

import { Landscape3dSphere } from './Landscape3dSphere';
import './Landscape3dSphere';


import { BoundingBox } from '../GIS/BoundingBox';
import { HamburgerMenuTree } from '../lib/components/HamburgerMenuTree';
import { CT_Config, CT_Button, CT_Selection, CT_Switch, ContextMenuTreeEventResult } from '../lib/components/ContextMenuTree';









const ACCESS_TOKEN = 'pk.eyJ1IjoidWlkMDEwODkiLCJhIjoiY2p6M295MGs2MDVkMDNwb2N5MHljNGFnZiJ9.QLijbhXZfDLxNfIEsBk9Xw';



class LeafMapMain extends Component {



	markers: Array<Marker>;
	map: Map;
	_reducer: RedMapMain;
	reduxListenerUnsubsribe: Function;
	private mapBoxUtil: GISUtil;
	geoJsonLayer: L.GeoJSON<any>;
	waymarkedtrails: TileLayer;
	featureCollection: FeatureCollectionImpl;
	clouds: TileLayer.WMS;
	rainRadar: TileLayer.WMS;
	parkingLayer: Overpass;
	alpine_hut: Overpass;
	wilderness_hut: Overpass;
	guest_house: Overpass;
	openTopoMap: CachedTileLayer;
	sat: CachedTileLayer;
	openStreetMap: CachedTileLayer;

	constructor() {
		super();

		this.markers = [];
		this._reducer = new RedMapMain();
		reduxStoreInstance.registerReducer(this._reducer);
		this.reduxListenerUnsubsribe = reduxStoreInstance.subscribe(() => this.reduxtrigger(reduxStoreInstance));
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

		this.waymarkedtrails = new TileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
			maxZoom: 18,
			attribution: '<a href="https://hiking.waymarkedtrails.org/help/legal">waymarkedtrails.org</a>'
		});






	}

	connectedCallback(): void {
		super.connectedCallback();
		console.log('MapMainWindow.');
		const mapElement = this.shadowRoot.getElementById("map") as HTMLElement;

		this.map = new Map(mapElement, {});




		// set the position and zoom level of the map
		this.map.setView([49.317390, 12.035533], 9);



		// create a tileLayer with the tiles, attribution
		this.openTopoMap = new CachedTileLayer('https://opentopomap.org/{z}/{x}/{y}.png', {
			maxZoom: 18,
			attribution: '<a href="http://opentopomap.org">opentopomap.org</a>'
		});

		this.openStreetMap = new CachedTileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 18,
			attribution: '<a href="http://openstreetmap.org">openstreetmap.org</a>'
		});


		// add the tile layer to the map
		this.openTopoMap.addTo(this.map);




		//this.waymarkedtrails.addTo(this.map);
		this.geoJsonLayer.addTo(this.map);

		// https://maps.dwd.de/geoserver/web/wicket/bookmarkable/org.geoserver.web.demo.MapPreviewPage?0
		this.clouds = new TileLayer.WMS("https://maps.dwd.de/geoserver/dwd/wms?", {
			layers: "dwd:SAT_WELT_KOMPOSIT",
			format: 'image/png',
			transparent: true,
			attribution: '<a href="https://maps.dwd.de/geoserver/web/">DWD-SAT_WELT_KOMPOSIT</a>'
		});

		//satelitte.addTo(this.map);

		// https://maps.dwd.de/geoserver/web/wicket/bookmarkable/org.geoserver.web.demo.MapPreviewPage?0
		this.rainRadar = new TileLayer.WMS("https://maps.dwd.de/geoserver/dwd/wms?", {
			layers: "dwd:FX-Produkt",
			format: 'image/png',
			transparent: true,
			attribution: '<a href="https://maps.dwd.de/geoserver/web/">DWD-FX-Produkt</a>'
		});

		//radar.addTo(this.map);

		//fetch("https://api.mapbox.com/v4/mapbox.satellite/9/451/202@2x.webp?sku=1019o2oswGt40&access_token=pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2p0MG01MXRqMW45cjQzb2R6b2ptc3J4MSJ9.zA2W0IkI0c6KaAhJfk9bWg", {

		this.sat = new CachedTileLayer('https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}{r}.webp?' + 'access_token=' + ACCESS_TOKEN);





		this.parkingLayer = new Overpass(12, './resources/marker-icon-park.png', 'amenity=parking');

		this.alpine_hut = new Overpass(12, './resources/marker-icon-park.png', 'tourism=alpine_hut');

		this.wilderness_hut = new Overpass(12, './resources/marker-icon-park.png', 'tourism=wilderness_hut');

		this.guest_house = new Overpass(12, './resources/marker-icon-park.png', 'tourism=guest_house');

		const overlayPane = {


		};

		// Add a layer control element to the map
		const layerControl = L.control.layers(null, overlayPane);
		//layerControl.addTo(this.map);

		//L.control.geocoder().addTo(this.map);




		this.map.on('click', (e) => {
			const event = e as LeafletMouseEvent
			const marker = new Marker(event.latlng, {
				draggable: true
			});

			marker.on('dragend', (e) => {
				//this.retrieveRoute();
				this._reducer.changeMarker(this.markers.indexOf(marker), { lonLatEle: { longitude: marker.getLatLng().lng, latitude: marker.getLatLng().lat } } as IMarker);
			});

			// Add it to the marker collection
			this.markers.push(marker);
			this._reducer.addMarker({ lonLatEle: { longitude: marker.getLatLng().lng, latitude: marker.getLatLng().lat } } as IMarker);


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

		const landscapeWindow3d = this.shadowRoot.getElementById("3DLandscape") as MidiWindow;
		landscapeWindow3d.hide();
		const landscapeWindow3dContent = this.shadowRoot.getElementById("3DLandscapeContent") as Landscape3dSphere;



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
					nodes: [],
					leafs:
						[
							{ name: "Map", value: "TopoMap", valueCollection: ["TopoMap", "Satellite", "OpenStreetMap"] } as CT_Selection,
							{ name: "Hiking tracks", value: false } as CT_Switch,
							{ name: "Clouds", value: false } as CT_Switch,
							{ name: "Raining", value: false } as CT_Switch,
							{ name: "Parking", value: false } as CT_Switch,
							{ name: "Alpin Hut", value: false } as CT_Switch,
							{ name: "Wilderness Hut", value: false } as CT_Switch,
							{ name: "Guest House", value: false } as CT_Switch,
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
							this._reducer.openGpxFile(files);
						});
					}

					break;
				case '/File operations/Save GPX file':
					this._reducer.saveGpxFile();
					break;
				case '/Routing/Delete all markers':
					this._reducer.delAllMarkers();
					break;
				case '/Routing/Automatic routing':
					this._reducer.toggleAutoRoute(details.value as boolean);
					break;
				case '/Layers/Hiking tracks':
					if (details.value) {
						this.map.addLayer(this.waymarkedtrails);
					} else {
						this.map.removeLayer(this.waymarkedtrails);
					}
					break;
				case '/Layers/Clouds':
					if (details.value) {
						this.map.addLayer(this.clouds);
					} else {
						this.map.removeLayer(this.clouds);
					}
					break;
				case '/Layers/Raining':
					if (details.value) {
						this.map.addLayer(this.rainRadar);
					} else {
						this.map.removeLayer(this.rainRadar);
					}
					break;
				case '/Layers/Parking':
					if (details.value) {
						this.map.addLayer(this.parkingLayer);
					} else {
						this.map.removeLayer(this.parkingLayer);
					}
					break;
				case '/Layers/Map':
					{
						switch (details.value) {
							case "TopoMap":
								{
									this.map.removeLayer(this.openTopoMap);
									this.map.removeLayer(this.openStreetMap);
									this.map.removeLayer(this.sat);

									this.map.addLayer(this.openTopoMap);

								}
								break;
							case "Satellite":
								{
									this.map.removeLayer(this.openTopoMap);
									this.map.removeLayer(this.openStreetMap);
									this.map.removeLayer(this.sat);

									this.map.addLayer(this.sat);
								}
								break;
							case "OpenStreetMap":
								{
									this.map.removeLayer(this.openTopoMap);
									this.map.removeLayer(this.openStreetMap);
									this.map.removeLayer(this.sat);

									this.map.addLayer(this.openStreetMap);
								}
								break;

						}
					}
					break;
				case '/Layers/Alpin Hut':
					if (details.value) {
						this.map.addLayer(this.alpine_hut);
					} else {
						this.map.removeLayer(this.alpine_hut);
					}
					break;
				case '/Layers/Wilderness Hut':
					if (details.value) {
						this.map.addLayer(this.wilderness_hut);
					} else {
						this.map.removeLayer(this.wilderness_hut);
					}
					break;
				case '/Layers/Guest House':
					if (details.value) {
						this.map.addLayer(this.guest_house);
					} else {
						this.map.removeLayer(this.guest_house);
					}
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

						//landscapeWindow3dContent.show(boundingBox, 'https://opentopomap.org/{z}/{x}/{y}.png', this.featureCollection, this.map.getZoom());
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
						this._reducer.deleteMarker(index, { lonLatEle: { longitude: marker.getLatLng().lng, latitude: marker.getLatLng().lat } } as IMarker);


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

		//FIXME
		<midi-window id='3DLandscape', title="3DLandscape">
            <three-landscape-element slot='content' id='3DLandscapeContent'></three-landscape-element>
        </midi-window>

		<!--midi-window id='3DLandscape', title="3DLandscape">
            <three-landscape-shpere-element slot='content' id='3DLandscapeContent'></three-landscape-shpere-element>
        </midi-window-->

        <file-dialog id="OpenGpxFileDialog"></file-dialog>

        `;
	}


	reduxtrigger(storeInstance): void {

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
				{
					console.log("- set directions");
					const directions: DirectionsImpl = storeInstance.getState().directions;
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
				this.map.flyTo([storeInstance.getState().center[1], storeInstance.getState().center[0]], 9);

				break;

			default:
				break;
		}
	}




}
window.customElements.define('leaf-map-main', LeafMapMain);

export { LeafMapMain, ACCESS_TOKEN };

