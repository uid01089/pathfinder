import { BoundingBox } from './BoundingBox';
import { GISUtil, TileInfo, LonLatEle } from './GISUtil';
import { PictureUtil } from '../lib/PictureUtil';
import { FeatureCollection, LineString, Position, Feature } from 'geojson';
import { Mutex } from '../lib/Mutex';

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
    url: string;
    canvas: HTMLCanvasElement;
    mutex: Mutex;

    constructor(bBox: BoundingBox, zoom: number, url: string) {
        this.gisUtil = new GISUtil();

        this.zoom = zoom;

        this.tailNw = this.gisUtil.getTailInfo(bBox.nwLon, bBox.nwLat, this.zoom);
        this.tailNe = this.gisUtil.getTailInfo(bBox.neLon, bBox.neLat, this.zoom);
        this.tailSw = this.gisUtil.getTailInfo(bBox.swLon, bBox.swLat, this.zoom);
        this.tailSe = this.gisUtil.getTailInfo(bBox.seLon, bBox.seLat, this.zoom);

        this.bBox = new BoundingBox(this.tailSw.leftUp.longitude, this.tailSw.leftUp.latitude - this.tailSw.latArea, //
            this.tailNe.leftUp.longitude + this.tailNe.lonArea, this.tailNe.leftUp.latitude);

        this.url = url;

        this.canvas = document.createElement('canvas') as HTMLCanvasElement;

        this.mutex = new Mutex();

        this.addTile(this.url);

    }

    getBoundingBox(): BoundingBox {
        return this.bBox;
    }

    async addTile(url: string) {

        var release: Function;
        try {
            release = await this.mutex.lock();
            var ctx = this.canvas.getContext('2d');

            var nrXTiles = this.tailNe.xTile - this.tailNw.xTile + 1;
            var nrYTiles = this.tailSw.yTile - this.tailNw.yTile + 1;

            this.canvas.width = nrXTiles * 256;
            this.canvas.height = nrYTiles * 256;

            for (var y = this.tailNw.yTile, yRunning = 0; y <= this.tailSw.yTile; y++ , yRunning++) {
                for (var x = this.tailNw.xTile, xRunning = 0; x <= this.tailNe.xTile; x++ , xRunning++) {

                    var fetchURL = url.replace('{z}', this.zoom.toString()).replace('{x}', x.toString()).replace('{y}', y.toString());
                    var picture = await PictureUtil.load(fetchURL);

                    ctx.drawImage(picture, picture.width * xRunning, picture.height * yRunning);

                }
            }
        } finally {
            release();
        }
    }


    private async getCoordinate(lonLat: LonLatEle): Promise<Point> {
        var dimension = await this.bBox.getDimensions();
        var latSpan = dimension.latitudeDelta;
        var lonSpan = dimension.longitudeDelta;
        var northWest = this.bBox.northWest;
        var xSpan = this.canvas.width;
        var ySpan = this.canvas.height;

        var lonXPoint = lonSpan / xSpan;
        var latYPoint = latSpan / ySpan;

        var deltaLon = lonLat.longitude - northWest.longitude;
        var deltaLat = -1 * (lonLat.latitude - northWest.latitude);

        var x = deltaLon / lonXPoint;
        var y = deltaLat / latYPoint;

        return { x: x, y: y } as Point;

    }


    private async addPathToCtx(ctx: CanvasRenderingContext2D, featureCollection: FeatureCollection<LineString>): Promise<void> {
        var firstPoint = true;
        for (var feature of featureCollection.features) {

            if ((typeof feature.geometry !== 'undefined') && (feature.geometry.type === "LineString")) {
                if (typeof feature.geometry.coordinates !== 'undefined') {
                    for (var coordinate of feature.geometry.coordinates) {
                        var point = await this.getCoordinate({ longitude: coordinate[0], latitude: coordinate[1] });

                        console.log(point);

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

    async addFeature(featureCollection: FeatureCollection<LineString>) {
        var release: Function;
        try {
            release = await this.mutex.lock();

            var ctx = this.canvas.getContext('2d');


            ctx.strokeStyle = "#FF0000";
            ctx.lineWidth = 5;
            ctx.beginPath();

            var promise = this.addPathToCtx(ctx, featureCollection);
            promise.then(() => {

                ctx.stroke();
            })




        } finally {
            release();
        }
    }

    async getCanvas(): Promise<HTMLCanvasElement> {

        var release: Function;
        try {
            release = await this.mutex.lock();
            return this.canvas;
        } finally {
            release();
        }
    }


}

export { CanvasMap };