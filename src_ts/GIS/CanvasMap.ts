import { BoundingBox } from './BoundingBox';
import { GISUtil, TileInfo, LonLatEle } from './GISUtil';
import { PictureUtil } from '../js_lib/PictureUtil';
import { FeatureCollection, LineString, Position, Feature } from 'geojson';
import { Mutex, UnlockFct } from '../js_lib/Mutex';
import { LayerStack } from './leaflet/LayerStack';

interface Point {
    x: number,
    y: number
}

class CanvasMap {
    private gisUtil: GISUtil;
    bBox: BoundingBox;
    zoom: number;
    tailNw: TileInfo;
    tailNe: TileInfo;
    tailSw: TileInfo;
    tailSe: TileInfo;
    canvas: HTMLCanvasElement;
    mutex: Mutex;


    constructor(bBox: BoundingBox, zoom: number) {
        this.gisUtil = new GISUtil();

        this.zoom = zoom;

        this.tailNw = this.gisUtil.getTileInfo(bBox.nwLon, bBox.nwLat, this.zoom);
        this.tailNe = this.gisUtil.getTileInfo(bBox.neLon, bBox.neLat, this.zoom);
        this.tailSw = this.gisUtil.getTileInfo(bBox.swLon, bBox.swLat, this.zoom);
        this.tailSe = this.gisUtil.getTileInfo(bBox.seLon, bBox.seLat, this.zoom);

        this.bBox = new BoundingBox(this.tailSw.leftUp.longitude, this.tailSw.leftUp.latitude - this.tailSw.latArea, //
            this.tailNe.leftUp.longitude + this.tailNe.lonArea, this.tailNe.leftUp.latitude);



        this.canvas = document.createElement('canvas') as HTMLCanvasElement;


        this.mutex = new Mutex();



    }

    getBoundingBox(): BoundingBox {
        return this.bBox;
    }

    async addTiles(layerStack: LayerStack<string>): Promise<void> {

        let release: UnlockFct;

        try {
            release = await this.mutex.lock();

            const ctx = this.canvas.getContext('2d');
            ctx.globalCompositeOperation = 'destination-atop';

            const nrXTiles = this.tailNe.xTile - this.tailNw.xTile + 1;
            const nrYTiles = this.tailSw.yTile - this.tailNw.yTile + 1;

            this.canvas.width = nrXTiles * 256;
            this.canvas.height = nrYTiles * 256;

            for (let y = this.tailNw.yTile, yRunning = 0; y <= this.tailSw.yTile; y++, yRunning++) {
                for (let x = this.tailNw.xTile, xRunning = 0; x <= this.tailNe.xTile; x++, xRunning++) {
                    for (const url of layerStack.getValidLayers()) {

                        const fetchURL = url.replace('{z}', this.zoom.toString()).replace('{x}', x.toString()).replace('{y}', y.toString());
                        const picture = await PictureUtil.load(fetchURL);

                        //https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
                        ctx.drawImage(picture, picture.width * xRunning, picture.height * yRunning);
                    }

                }
            }
        } finally {
            release();
        }
    }


    private async getCoordinate(lonLat: LonLatEle, zoom: number): Promise<Point> {
        const dimension = await this.bBox.getDimensions(zoom);
        const latSpan = dimension.latitudeDelta;
        const lonSpan = dimension.longitudeDelta;
        const northWest = this.bBox.northWest;
        const xSpan = this.canvas.width;
        const ySpan = this.canvas.height;

        const lonXPoint = lonSpan / xSpan;
        const latYPoint = latSpan / ySpan;

        const deltaLon = lonLat.longitude - northWest.longitude;
        const deltaLat = -1 * (lonLat.latitude - northWest.latitude);

        const x = deltaLon / lonXPoint;
        const y = deltaLat / latYPoint;

        return { x: x, y: y } as Point;

    }


    private async addPathToCtx(ctx: CanvasRenderingContext2D, featureCollection: FeatureCollection<LineString>, zoom: number): Promise<void> {
        let firstPoint = true;
        for (const feature of featureCollection.features) {

            if ((typeof feature.geometry !== 'undefined') && (feature.geometry.type === "LineString")) {
                if (typeof feature.geometry.coordinates !== 'undefined') {
                    for (const coordinate of feature.geometry.coordinates) {
                        const point = await this.getCoordinate({ longitude: coordinate[0], latitude: coordinate[1] }, zoom);



                        if (firstPoint) {
                            firstPoint = false;
                            ctx.moveTo(point.x, point.y);
                        }
                        ctx.lineTo(point.x, point.y);
                    }
                }
            }
        }
    }

    async addFeature(featureCollection: FeatureCollection<LineString>, zoom: number): Promise<void> {
        let release: UnlockFct;
        try {
            release = await this.mutex.lock();

            const ctx = this.canvas.getContext('2d');


            ctx.strokeStyle = "#FF0000";
            ctx.lineWidth = 5;
            ctx.beginPath();

            const promise = this.addPathToCtx(ctx, featureCollection, zoom);
            promise.then(() => {

                ctx.stroke();
            })

        } finally {
            release();
        }
    }

    async getCanvas(): Promise<HTMLCanvasElement> {

        let release: UnlockFct;
        try {
            release = await this.mutex.lock();
            return this.canvas;
        } finally {
            release();
        }
    }


}

export { CanvasMap };