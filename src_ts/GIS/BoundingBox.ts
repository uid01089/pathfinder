import { LonLatEle } from "./GISUtil";


class BoundingBox {

    public southWest: LonLatEle;
    public northEast: LonLatEle;
    swLon: number;
    swLat: number;
    neLon: number;
    neLat: number;



    constructor(swLon: number, swLat: number, neLon: number, neLat: number) {
        this.southWest = [swLon, swLat];
        this.northEast = [neLon, neLat];

        this.swLon = swLon;
        this.swLat = swLat;
        this.neLon = neLon;
        this.neLat = neLat;
    }

    isPointIncluded(point: LonLatEle): boolean {

        var lonPoint = point[0];
        var latPoint = point[1];

        var inPoint = (lonPoint >= this.swLon) && (lonPoint <= this.neLon) && (latPoint >= this.swLat) && (latPoint <= this.neLat);
        return inPoint;
    }

    isBoxIncluded(bbox: BoundingBox): boolean {
        return this.isPointIncluded(bbox.southWest) && this.isPointIncluded(bbox.northEast);
    }



}

export { BoundingBox };