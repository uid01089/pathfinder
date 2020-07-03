import { ReduxComponent } from '../js_web_comp_lib/ReduxComponent';
import { Action } from 'redux';
import { reduxStoreInstance, State } from '../ReduxStore';
import { CSS } from '../Css';
import { AbstractReduxStore } from '../js_web_comp_lib/AbstractReduxStore';
import { AbstractReducer } from '../js_web_comp_lib/AbstractReducer';

import * as THREE from 'three';
import * as OrbitControls from 'three-orbitcontrols';
import { BoundingBox } from '../GIS/BoundingBox';
import { WebGLRenderer, WebGLRendererParameters } from 'three';
import { Elevation } from '../GIS/Elevation';
import { CanvasMap } from '../GIS/CanvasMap';
import { FeatureCollection, LineString } from 'geojson';
import { GISUtil } from '../GIS/GISUtil';
import { Point } from 'leaflet';
import { LayerStack } from '../GIS/leaflet/LayerStack';

interface PointXYZ {
    x: number,
    y: number,
    z: number
}

class Landscape3dSphereReducer extends AbstractReducer<State> {
    constructor() {
        super(reduxStoreInstance);
    }
    reducer(state: State, action: Action): State {

        return state;
    }
}

const EARTHRADIUS = 6371000;
const ZOOM = 0.01;
const TOPOMAP_TILE = 'https://opentopomap.org/{z}/{x}/{y}.png';


class Landscape3dSphere extends ReduxComponent<State> {
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    scene: THREE.Scene;
    layerStack: LayerStack<string>;


    constructor() {
        super(new Landscape3dSphereReducer(), reduxStoreInstance);




    }

    /**
     * Called every time the element is inserted into the DOM. Useful for running setup code,
     * such as fetching resources or rendering. Generally, you should try to delay work until
     * this time.
     */
    connectedCallback() {
        super.connectedCallback();


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


        this.controls = new OrbitControls(this.camera, this.renderer.domElement);


        this.layerStack = new LayerStack({ addLayerOperation: null, removeLayerOperation: null, updateFinishedOperation: null })
        this.layerStack.addLayer(TOPOMAP_TILE);
        this.layerStack.showLayer(TOPOMAP_TILE, true);





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
              height: 500px; 
              width: 800px;
              }
        </style>

        <section>
          <canvas id="Canvas"></canvas>
        </section>        

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


        this.scene = new THREE.Scene();


        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);

        this.setupCamera();
        this.addLights();
        //this.addGround(bBox, tile, featureCollection, zoom);



        this.render();

    }

    private async addGround(bBox: BoundingBox, tile: string, featureCollection: FeatureCollection, zoom: number) {

        const canvasMap = new CanvasMap(bBox, zoom);
        await canvasMap.addTiles(this.layerStack);
        await canvasMap.addFeature(featureCollection as FeatureCollection<LineString>, zoom);
        const canvas = await canvasMap.getCanvas();
        const bBoxCanvas = canvasMap.getBoundingBox();


        const RASTER = 200;
        const SIZE = 2000;



        const dimension = await bBoxCanvas.getDimensions(zoom);
        const zoomLevel = SIZE / dimension.y;

        /*
            PlaneGeometry(width : Float, height : Float, widthSegments : Integer, heightSegments : Integer)
            width — Width along the X axis. Default is 1.
            height — Height along the Y axis. Default is 1.
            widthSegments — Optional. Default is 1.
            heightSegments — Optional. Default is 1.
        */



        //var geometry = new THREE.PlaneGeometry(SIZE * canvas.width / canvas.height, SIZE, RASTER - 1, RASTER - 1);
        /*
            SphereGeometry(radius : Float, widthSegments : Integer, heightSegments : Integer, phiStart : Float, phiLength : Float, thetaStart : Float, thetaLength : Float)
            
            radius — sphere radius. Default is 1.
            widthSegments — number of horizontal segments. Minimum value is 3, and the default is 8.
            heightSegments — number of vertical segments. Minimum value is 2, and the default is 6.
            phiStart — specify horizontal starting angle. Default is 0.
            phiLength — specify horizontal sweep angle size. Default is Math.PI * 2.
            thetaStart — specify vertical starting angle. Default is 0.
            thetaLength — specify vertical sweep angle size. Default is Math.PI.
            The geometry is created by sweeping and calculating vertexes around the Y axis (horizontal sweep) 
            and the Z axis (vertical sweep). Thus, incomplete spheres (akin to 'sphere slices') can be created 
            through the use of different values of phiStart, phiLength, thetaStart and thetaLength, in order 
            to define the points in which we start (or end) calculating those vertices.
        */

        const phiStart = GISUtil.degToRadians(90 + bBoxCanvas.swLon);
        const phiLength = GISUtil.degToRadians(bBoxCanvas.seLon - bBoxCanvas.swLon);




        const thetaStart = GISUtil.degToRadians(bBoxCanvas.swLat);
        const thetaLength = GISUtil.degToRadians(bBoxCanvas.nwLat - bBoxCanvas.swLat);



        const geometry = new THREE.SphereGeometry(EARTHRADIUS * ZOOM, RASTER - 1, RASTER - 1, phiStart, phiLength, thetaStart, thetaLength);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;

        const material = new THREE.MeshBasicMaterial({
            map: texture
        });


        const elevations = await this.retrieveElevations(bBoxCanvas, RASTER, zoom);






        for (let i = 0; i < geometry.vertices.length; i++) {


            /*console.log(geometry.vertices[i].x);
            console.log(elevations[i].x);
            console.log(geometry.vertices[i].y);
            console.log(elevations[i].y);
            console.log(geometry.vertices[i].z);
            console.log(elevations[i].z);*/


            geometry.vertices[i].x = elevations[i].x;
            geometry.vertices[i].y = elevations[i].y;
            geometry.vertices[i].z = elevations[i].z;
        }






        const plane = new THREE.Mesh(geometry, material);

        plane.position.z = 0;
        plane.position.y = 0;
        plane.position.x = 0;


        this.scene.add(plane);
        /*
        plane.rotateX(GISUtil.degToRadians(90 - (bBoxCanvas.seLat + bBoxCanvas.neLat) / 2));
        plane.rotateY(GISUtil.degToRadians(-1 * (bBoxCanvas.seLon + bBoxCanvas.swLon) / 2));
        plane.position.z = -EARTHRADIUS * ZOOM;
        */



        /*
        var q = new THREE.Quaternion();
        q.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), 90 * Math.PI / 180);
        plane.quaternion.multiplyQuaternions(q, plane.quaternion);
        */
        /*
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        */



        const axesHelper = new THREE.AxesHelper(4000);
        this.scene.add(axesHelper);

        console.log("Finished");





    }

    private async retrieveElevations(bBox: BoundingBox, raster: number, zoom: number): Promise<PointXYZ[]> {
        const dimension = await bBox.getDimensions(zoom);
        const elevationProvider = new Elevation();


        const elevations: PointXYZ[] = [];
        const longStep = dimension.longitudeDelta / raster;
        const latiStep = dimension.latitudeDelta / raster;
        for (let y = 0; y < raster; y++) {

            const runningLatitude = bBox.neLat - latiStep * y;
            for (let x = 0; x < raster; x++) {
                const runningLongitude = bBox.swLon + longStep * x;

                const elevation = await elevationProvider.getElevation({ longitude: runningLongitude, latitude: runningLatitude }, 'pk.eyJ1IjoidWlkMDEwODkiLCJhIjoiY2p6M295MGs2MDVkMDNwb2N5MHljNGFnZiJ9.QLijbhXZfDLxNfIEsBk9Xw', zoom);

                const _r = (EARTHRADIUS + 0) * ZOOM;
                /*
                var _z = _r * Math.cos(GISUtil.degToRadians(runningLongitude));
                var _x = _r * Math.sin(GISUtil.degToRadians(runningLongitude));
                var _y = _r * Math.cos(GISUtil.degToRadians(90 - runningLatitude));
                */

                const _z = _r * Math.sin(GISUtil.degToRadians(90 + runningLatitude)) * Math.cos(GISUtil.degToRadians(runningLongitude));
                const _x = _r * Math.sin(GISUtil.degToRadians(90 + runningLatitude)) * Math.sin(GISUtil.degToRadians(runningLongitude));
                const _y = _r * Math.cos(GISUtil.degToRadians(90 + runningLatitude));

                /*
                x=sin(u)cos(t)
                y=sin(u)sin(t)
                z=cos(u)
                */


                elevations.push({ x: _x, y: _y, z: _z });

            }
        }

        return elevations;
    }

    private setupCamera() {
        this.camera.position.z = 2 * EARTHRADIUS * ZOOM;
        this.camera.position.y = 0;
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

        //console.log(this.camera.position);
    }




}
window.customElements.define('three-landscape-shpere-element', Landscape3dSphere);

export { Landscape3dSphere };

