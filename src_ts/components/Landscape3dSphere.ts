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

class Landscape3dSphere extends ReduxComponent<State> {
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    scene: THREE.Scene;


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
    registerCallBack() {
        super.registerCallBack();

        let canvas = this.shadowRoot.getElementById("Canvas") as HTMLCanvasElement;



        this.renderer = new THREE.WebGLRenderer({ canvas: canvas } as WebGLRendererParameters);
        this.camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 10000);


        this.controls = new OrbitControls(this.camera, this.renderer.domElement);







    }

    /**
     * Returns the HTML from which a template shall be created
     */
    getHTML() {

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
    triggeredFromRedux(reduxStore: AbstractReduxStore<State>) {

        super.triggeredFromRedux(reduxStore);

        // Do needful things as reaction of state change
        // meaning update UI :-)
        switch (reduxStore.getState().action) {
            default:
        };
    }

    /**
     * 
     * @param bBox 
     */
    show(bBox: BoundingBox, tile: string, featureCollection: FeatureCollection, zoom: number) {


        this.scene = new THREE.Scene();


        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        var cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);

        this.setupCamera();
        this.addLights();
        this.addGround(bBox, tile, featureCollection, zoom);



        this.render();

    }

    private async addGround(bBox: BoundingBox, tile: string, featureCollection: FeatureCollection, zoom: number) {

        var canvasMap = new CanvasMap(bBox, zoom, tile);
        canvasMap.addFeature(featureCollection as FeatureCollection<LineString>);
        var canvas = await canvasMap.getCanvas();
        let bBoxCanvas = canvasMap.getBoundingBox();


        const RASTER = 200;
        const SIZE = 2000;



        var dimension = await bBoxCanvas.getDimensions();
        let zoomLevel = SIZE / dimension.y;

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

        var phiStart = GISUtil.degToRadians(90 + bBoxCanvas.swLon);
        var phiLength = GISUtil.degToRadians(bBoxCanvas.seLon - bBoxCanvas.swLon);




        var thetaStart = GISUtil.degToRadians(bBoxCanvas.swLat);
        var thetaLength = GISUtil.degToRadians(bBoxCanvas.nwLat - bBoxCanvas.swLat);



        var geometry = new THREE.SphereGeometry(EARTHRADIUS * ZOOM, RASTER - 1, RASTER - 1, phiStart, phiLength, thetaStart, thetaLength);

        var texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;

        var material = new THREE.MeshBasicMaterial({
            map: texture
        });


        var elevations = await this.retrieveElevations(bBoxCanvas, RASTER);






        for (var i = 0; i < geometry.vertices.length; i++) {


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






        var plane = new THREE.Mesh(geometry, material);

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



        var axesHelper = new THREE.AxesHelper(4000);
        this.scene.add(axesHelper);

        console.log("Finished");





    }

    private async retrieveElevations(bBox: BoundingBox, raster: number): Promise<PointXYZ[]> {
        let dimension = await bBox.getDimensions();
        let elevationProvider = new Elevation();

        var elevations: PointXYZ[] = [];
        const longStep = dimension.longitudeDelta / raster;
        const latiStep = dimension.latitudeDelta / raster;
        for (var y = 0; y < raster; y++) {

            var runningLatitude = bBox.neLat - latiStep * y;
            for (var x = 0; x < raster; x++) {
                var runningLongitude = bBox.swLon + longStep * x;

                var elevation = await elevationProvider.getElevation({ longitude: runningLongitude, latitude: runningLatitude }, 'pk.eyJ1IjoidWlkMDEwODkiLCJhIjoiY2p6M295MGs2MDVkMDNwb2N5MHljNGFnZiJ9.QLijbhXZfDLxNfIEsBk9Xw');

                var _r = (EARTHRADIUS + 0) * ZOOM;
                /*
                var _z = _r * Math.cos(GISUtil.degToRadians(runningLongitude));
                var _x = _r * Math.sin(GISUtil.degToRadians(runningLongitude));
                var _y = _r * Math.cos(GISUtil.degToRadians(90 - runningLatitude));
                */

                var _z = _r * Math.sin(GISUtil.degToRadians(90 + runningLatitude)) * Math.cos(GISUtil.degToRadians(runningLongitude));
                var _x = _r * Math.sin(GISUtil.degToRadians(90 + runningLatitude)) * Math.sin(GISUtil.degToRadians(runningLongitude));
                var _y = _r * Math.cos(GISUtil.degToRadians(90 + runningLatitude));

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
        var ambientLight = new THREE.AmbientLight(0x444444);
        ambientLight.intensity = 0.8;
        this.scene.add(ambientLight);

        var directionalLight = new THREE.DirectionalLight(0xffffff);

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

    render() {
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

