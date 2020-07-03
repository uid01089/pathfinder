import { LonLatEle, GISUtil } from "./GISUtil";
import { Elevation } from '../GIS/Elevation';

interface Dimensions {
    longitudeDelta: number,
    latitudeDelta: number,
    x: number,
    y: number
}

class BoundingBox {

    public southWest: LonLatEle;
    public northEast: LonLatEle;
    public northWest: LonLatEle;
    public southEast: LonLatEle;

    swLon: number;
    swLat: number;
    neLon: number;
    neLat: number;
    nwLat: number;
    nwLon: number;
    seLat: number;
    seLon: number;
    dimension: Dimensions;



    constructor(swLon: number, swLat: number, neLon: number, neLat: number) {



        this.swLon = swLon;
        this.swLat = swLat;
        this.neLon = neLon;
        this.neLat = neLat;
        this.nwLat = neLat;
        this.nwLon = swLon;
        this.seLat = swLat;
        this.seLon = neLon;

        this.northWest = { longitude: this.nwLon, latitude: this.nwLat };
        this.southEast = { longitude: this.seLon, latitude: this.seLat };

        this.northEast = { longitude: neLon, latitude: neLat };
        this.southWest = { longitude: swLon, latitude: swLat };

    }

    isPointIncluded(point: LonLatEle): boolean {

        const lonPoint = point.longitude;
        const latPoint = point.latitude;

        const inPoint = (lonPoint >= this.swLon) && (lonPoint <= this.neLon) && (latPoint >= this.swLat) && (latPoint <= this.neLat);
        return inPoint;
    }

    isBoxIncluded(bBox: BoundingBox): boolean {
        return this.isPointIncluded(bBox.southWest) && this.isPointIncluded(bBox.northEast);
    }

    async getDimensions(zoom: number): Promise<Dimensions> {

        const elevations = new Elevation();

        if (null == this.dimension) {
            const gisUtil = new GISUtil();


            const nwElevation = await elevations.getElevation({ longitude: this.nwLon, latitude: this.nwLat }, 'pk.eyJ1IjoidWlkMDEwODkiLCJhIjoiY2p6M295MGs2MDVkMDNwb2N5MHljNGFnZiJ9.QLijbhXZfDLxNfIEsBk9Xw', zoom);

            const lat = Math.abs(this.neLat - this.seLat);
            const lon = Math.abs(this.neLon - this.nwLon);
            // distance(lon1: number, lat1: number, el1: number, lon2: number, lat2: number, el2: number)
            const x = gisUtil.distance(this.nwLon, this.nwLat, nwElevation, this.neLon, this.neLat, nwElevation);
            const y = gisUtil.distance(this.nwLon, this.nwLat, nwElevation, this.swLon, this.swLat, nwElevation);

            this.dimension = {
                latitudeDelta: lat,
                longitudeDelta: lon,
                x: x,
                y: y

            };
        }

        return this.dimension;


    }



}

export { BoundingBox, Dimensions };