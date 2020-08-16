import { ReduxComponent } from '../js_web_comp_lib/ReduxComponent';
import { reduxStoreInstance, State } from '../ReduxStore';
import { CSS } from '../Css';
import { AbstractReduxStore } from '../js_web_comp_lib/AbstractReduxStore';
import { AbstractReducer, Action } from '../js_web_comp_lib/AbstractReducer';

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls";
import { BoundingBox } from '../GIS/BoundingBox';
import { WebGLRenderer, WebGLRendererParameters } from 'three';
import { Elevation } from '../GIS/Elevation';
import { CanvasMap } from '../GIS/CanvasMap';
import { FeatureCollection, LineString } from 'geojson';
import { HamburgerMenuTree } from '../js_lib/components/HamburgerMenuTree';
import '../js_lib/components/HamburgerMenuTree';
import { CT_Config, ContextMenuTreeEventResult, CT_Selection, CT_Switch } from '../js_lib/components/ContextMenuTree';
import '../js_lib/components/Loader';
import { LayerStack } from '../GIS/leaflet/LayerStack';
import { MidiWindowEventResult } from '../js_lib/components/MidiWindow';



class Landscape3dReducer extends AbstractReducer<State> {
    constructor() {
        super(reduxStoreInstance);
    }
    reducer(state: State, action: Action<any>): State {

        return state;
    }
}

const ACCESS_TOKEN = 'pk.eyJ1IjoidWlkMDEwODkiLCJhIjoiY2p6M295MGs2MDVkMDNwb2N5MHljNGFnZiJ9.QLijbhXZfDLxNfIEsBk9Xw';


const TOPOMAP_TILE = 'https://opentopomap.org/{z}/{x}/{y}.png';
const MAPBOX_SATELLITE_TILE = 'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.webp?' + 'access_token=' + ACCESS_TOKEN;
const OPENSTREETMAP_TILE = 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png';
const WAY_MARKET_TRAILS_HIKING = 'https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png';
const WAY_MARKET_TRAILS_CYCLING = 'https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png';
const WAY_MARKET_TRAILS_RIDING = 'https://tile.waymarkedtrails.org/riding/{z}/{x}/{y}.png';
const GOOGLE_HYPRID_TILE = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
const GOOGLE_SATELLITE_TILE = 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';



class Landscape3d extends ReduxComponent<State> {
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    scene: THREE.Scene;
    bBox: BoundingBox;
    featureCollection: any;
    zoom: number;
    layerStack: LayerStack<string>;
    reducer: Landscape3dReducer;


    constructor() {
        const reducer = new Landscape3dReducer();
        super(reducer, reduxStoreInstance);
        this.reducer = reducer;



    }

    /**
     * Called every time the element is inserted into the DOM. Useful for running setup code,
     * such as fetching resources or rendering. Generally, you should try to delay work until
     * this time.
     */
    connectedCallback(): void {
        super.connectedCallback();

        this.parentElement.addEventListener('midiWindowChanged', (e: CustomEvent) => {
            // Update in case the MIDI-Window was changed
            const details: MidiWindowEventResult = e.detail;



            //this.update();
        });
    }

    /**
     * Can be used to register call back operations
     *
     * @memberof Component
     */
    registerCallBack(): void {
        super.registerCallBack();

        const canvas = this.shadowRoot.getElementById("Canvas") as HTMLCanvasElement;



        this.renderer = new THREE.WebGLRenderer({ canvas: canvas } as WebGLRendererParameters);
        this.camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 10000);

        this.layerStack = new LayerStack({ addLayerOperation: null, removeLayerOperation: null, updateFinishedOperation: null })
        this.layerStack.addLayer(TOPOMAP_TILE);
        this.layerStack.showLayer(TOPOMAP_TILE, true);
        this.layerStack.addLayer(MAPBOX_SATELLITE_TILE);
        this.layerStack.addLayer(OPENSTREETMAP_TILE);
        this.layerStack.addLayer(GOOGLE_HYPRID_TILE);
        this.layerStack.addLayer(GOOGLE_SATELLITE_TILE);
        this.layerStack.addLayer(WAY_MARKET_TRAILS_CYCLING);
        this.layerStack.addLayer(WAY_MARKET_TRAILS_HIKING);
        this.layerStack.addLayer(WAY_MARKET_TRAILS_RIDING);


        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        const contextHamburgerMenu = this.shadowRoot.getElementById("hamburgerMenu") as HamburgerMenuTree;




        const config: CT_Config = {
            nodes: [
                {
                    name: "Map",
                    nodes: [{
                        name: "Layers",
                        nodes: [

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
                            ]
                    }],
                    leafs: [
                        { name: "Map", value: "TopoMap", valueCollection: ["TopoMap", "Mapbox Satellite", "OpenStreetMap", "Google Satellite", "Google Hyprid"] } as CT_Selection,

                    ]
                }], leafs: []
        };

        contextHamburgerMenu.setConfig(config);
        contextHamburgerMenu.addEventListener('valueSelected', (e: CustomEvent) => {
            const details: ContextMenuTreeEventResult = e.detail;

            console.log(details.path);

            switch (details.path) {
                case '/Map/Map':
                    {
                        switch (details.value) {
                            case "TopoMap":
                                {
                                    this.layerStack.showLayer(TOPOMAP_TILE, true);
                                    this.layerStack.showLayer(MAPBOX_SATELLITE_TILE, false);
                                    this.layerStack.showLayer(OPENSTREETMAP_TILE, false);
                                    this.layerStack.showLayer(GOOGLE_SATELLITE_TILE, false);
                                    this.layerStack.showLayer(GOOGLE_HYPRID_TILE, false);
                                    this.updateShow();
                                }
                                break;
                            case "Mapbox Satellite":
                                {
                                    this.layerStack.showLayer(TOPOMAP_TILE, false);
                                    this.layerStack.showLayer(MAPBOX_SATELLITE_TILE, true);
                                    this.layerStack.showLayer(OPENSTREETMAP_TILE, false);
                                    this.layerStack.showLayer(GOOGLE_SATELLITE_TILE, false);
                                    this.layerStack.showLayer(GOOGLE_HYPRID_TILE, false);
                                    this.updateShow();
                                }
                                break;
                            case "OpenStreetMap":
                                {
                                    this.layerStack.showLayer(TOPOMAP_TILE, false);
                                    this.layerStack.showLayer(MAPBOX_SATELLITE_TILE, false);
                                    this.layerStack.showLayer(OPENSTREETMAP_TILE, true);
                                    this.layerStack.showLayer(GOOGLE_SATELLITE_TILE, false);
                                    this.layerStack.showLayer(GOOGLE_HYPRID_TILE, false);

                                    this.updateShow();
                                }
                                break;
                            case "Google Satellite":
                                {
                                    this.layerStack.showLayer(TOPOMAP_TILE, false);
                                    this.layerStack.showLayer(MAPBOX_SATELLITE_TILE, false);
                                    this.layerStack.showLayer(OPENSTREETMAP_TILE, false);
                                    this.layerStack.showLayer(GOOGLE_SATELLITE_TILE, true);
                                    this.layerStack.showLayer(GOOGLE_HYPRID_TILE, false);

                                    this.updateShow();
                                }
                                break;
                            case "Google Hyprid":
                                {
                                    this.layerStack.showLayer(TOPOMAP_TILE, false);
                                    this.layerStack.showLayer(MAPBOX_SATELLITE_TILE, false);
                                    this.layerStack.showLayer(OPENSTREETMAP_TILE, false);
                                    this.layerStack.showLayer(GOOGLE_SATELLITE_TILE, false);
                                    this.layerStack.showLayer(GOOGLE_HYPRID_TILE, true);

                                    this.updateShow();
                                }

                        }
                    }
                    break;
                case '/Map/Layers/waymarkedtrails/Hiking tracks':
                    {
                        this.layerStack.showLayer(WAY_MARKET_TRAILS_HIKING, details.value as boolean);
                        this.updateShow();
                    }
                    break;
                case '/Map/Layers/waymarkedtrails/Cycling tracks':
                    {
                        this.layerStack.showLayer(WAY_MARKET_TRAILS_CYCLING, details.value as boolean);
                        this.updateShow();

                    }
                    break;
                case '/Map/Layers/waymarkedtrails/Riding tracks':
                    {
                        this.layerStack.showLayer(WAY_MARKET_TRAILS_RIDING, details.value as boolean);
                        this.updateShow();

                    }
                    break;
                default:
                    break;
            }
        });


    }

    /**
     * Returns the HTML from which a template shall be created
     */
    getHTML(): string {

        return ReduxComponent.html` 
        ${CSS}



        <style>
          #Canvas { 
              display: block; 
             
              height: 100%; 
              width: 100%;
            
              }

            #Loader {
                position: absolute;
                top: 50%;
                left: 50%;
                display:block
            }
        </style>


        <!-- Hamburger menu -->
        <hamburger-menu-tree  id="hamburgerMenu"></hamburger-menu-tree>
                
        <canvas id="Canvas"></canvas>

        <loader-element id="Loader"></loader-element>
        

         

        `;
    }

    /**
     * This operation is called by Redux
     * @param reduxStore 
     */
    triggeredFromRedux(reduxStore: AbstractReduxStore<State>): void {

        super.triggeredFromRedux(reduxStore);

        // Do needful things as reaction of state change
        // meaning update UI :-)
        switch (reduxStore.getState().action) {
            default:
        }
    }

    /**
     * 
     * @param bBox 
     */
    show(bBox: BoundingBox, featureCollection: FeatureCollection, zoom: number): void {


        const loader = this.shadowRoot.getElementById("Loader") as HTMLScriptElement;
        loader.style.display = 'block';

        this.bBox = bBox;
        this.featureCollection = featureCollection;
        this.zoom = zoom;

        this.scene = new THREE.Scene();


        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);

        this.setupCamera();
        this.addLights();
        const promise = this.addGround(bBox, featureCollection, zoom);
        promise.then(() => {
            this.render();

            loader.style.display = 'none';
        });










    }

    private updateShow(): void {
        this.show(this.bBox, this.featureCollection, this.zoom);
    }



    private async addGround(bBox: BoundingBox, featureCollection: FeatureCollection, zoom: number): Promise<void> {

        const canvasMap = new CanvasMap(bBox, zoom);

        // Add all tiles step by step
        await canvasMap.addTiles(this.layerStack);

        // add the Track at last level
        await canvasMap.addFeature(featureCollection as FeatureCollection<LineString>, zoom);
        const canvas = await canvasMap.getCanvas();
        const bBoxCanvas = canvasMap.getBoundingBox();


        /*
        PlaneGeometry(width : Float, height : Float, widthSegments : Integer, heightSegments : Integer)
        width — Width along the X axis.Default is 1.
        height — Height along the Y axis.Default is 1.
        widthSegments — Optional.Default is 1.
        heightSegments — Optional.Default is 1.
        */

        const RASTER = 200;
        const SIZE = 2000;


        const dimension = await bBoxCanvas.getDimensions(zoom);
        const zoomLevel = SIZE / dimension.y;

        //var geometry = new THREE.PlaneGeometry(SIZE * window.innerWidth / window.innerHeight, SIZE, RASTER - 1, RASTER - 1);
        const geometry = new THREE.PlaneGeometry(SIZE * canvas.width / canvas.height, SIZE, RASTER - 1, RASTER - 1);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;

        const material = new THREE.MeshBasicMaterial({
            map: texture
        });

        const elevations = await this.retrieveElevations(bBoxCanvas, RASTER, zoom);


        // Calculate offset which may be removed
        let minElevation = Number.POSITIVE_INFINITY;
        elevations.forEach((elevation) => {
            minElevation = Math.min(minElevation, elevation);
        })



        for (let i = 0; i < geometry.vertices.length; i++) {
            const normHight = elevations[i] - minElevation;
            geometry.vertices[i].z = normHight * zoomLevel;
        }

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();


        const plane = new THREE.Mesh(geometry, material);

        const q = new THREE.Quaternion();
        q.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), 90 * Math.PI / 180);
        plane.quaternion.multiplyQuaternions(q, plane.quaternion);

        this.scene.add(plane);






    }

    private async retrieveElevations(bBox: BoundingBox, raster: number, zoom: number): Promise<number[]> {
        const dimension = await bBox.getDimensions(zoom);
        const elevationProvider = new Elevation();

        const elevations: number[] = [];
        const longStep = dimension.longitudeDelta / raster;
        const latiStep = dimension.latitudeDelta / raster;
        for (let y = 0; y < raster; y++) {

            const runningLatitude = bBox.neLat - latiStep * y;
            for (let x = 0; x < raster; x++) {
                const runningLongitude = bBox.swLon + longStep * x;

                const elevation = await elevationProvider.getElevation({ longitude: runningLongitude, latitude: runningLatitude }, 'pk.eyJ1IjoidWlkMDEwODkiLCJhIjoiY2p6M295MGs2MDVkMDNwb2N5MHljNGFnZiJ9.QLijbhXZfDLxNfIEsBk9Xw', zoom);
                elevations.push(elevation);

            }
        }

        return elevations;
    }

    private setupCamera() {
        this.camera.position.z = 2000;
        this.camera.position.y = 240;
        this.camera.position.x = 0;
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.controls.update();
    }

    private addLights() {
        const ambientLight = new THREE.AmbientLight(0x444444);
        ambientLight.intensity = 0.8;
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff);

        directionalLight.position.set(900, 400, 0).normalize();
        this.scene.add(directionalLight);
    }

    resizeRendererToDisplaySize(): boolean {
        const canvas: HTMLCanvasElement = this.renderer.domElement;
        const width: number = canvas.clientWidth;
        const height: number = canvas.clientHeight;
        const needResize: boolean = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            this.renderer.setSize(width, height, false);
        }
        return needResize;
    }

    render(): void {
        if (this.resizeRendererToDisplaySize()) {
            const canvas: HTMLCanvasElement = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
            this.controls.update();
        }

        requestAnimationFrame(() => { this.render(); });
        this.renderer.render(this.scene, this.camera);
    }




}
window.customElements.define('three-landscape-element', Landscape3d);

export { Landscape3d };

