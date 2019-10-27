
type LonLatEle = number[];


interface TileInfo {
    xTile: number,
    yTile: number,
    zoom: number,
    leftUp: LonLatEle,
    lonArea: number;
    latArea: number


}

class GISUtil {
    private accessToken: string;


    constructor(accessToken: string = 'xxx') {
        this.accessToken = accessToken;
    }


    /**
     * Calculate distance between two points in latitude and longitude taking
     * into account height difference. If you are not interested in height
     * difference pass 0.0. Uses Haversine method as its base.
     * 
     * lat1, lon1 Start point lat2, lon2 End point el1 Start altitude in meters
     * el2 End altitude in meters
     * @returns Distance in Meters
     */


    distance(lon1: number, lat1: number, el1: number,
        lon2: number, lat2: number, el2: number) {

        const R: number = 6371; // Radius of the earth

        const latDistance = this.degToRadians(lat2 - lat1);
        const lonDistance = this.degToRadians(lon2 - lon1);
        const a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
            + Math.cos(this.degToRadians(lat1)) * Math.cos(this.degToRadians(lat2))
            * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var distance = R * c * 1000; // convert to meters

        const height = el1 - el2;

        distance = Math.pow(distance, 2) + Math.pow(height, 2);

        return Math.sqrt(distance);
    }

    degToRadians(degrees: number): number {
        var pi = Math.PI;
        return degrees * (pi / 180);
    }



    getTailInfo(lon: number, lat: number, zoom: number): TileInfo {
        //https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29

        let longTile = Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
        let latTile = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
        let longStartTile = (longTile / Math.pow(2, zoom) * 360 - 180);
        var n = Math.PI - 2 * Math.PI * latTile / Math.pow(2, zoom);
        let latStartTile = 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

        let longStartTileNext = ((longTile + 1) / Math.pow(2, zoom) * 360 - 180);
        var nNext = Math.PI - 2 * Math.PI * (latTile + 1) / Math.pow(2, zoom);
        let latStartTileNext = 180 / Math.PI * Math.atan(0.5 * (Math.exp(nNext) - Math.exp(-nNext)));

        return {
            xTile: longTile,
            yTile: latTile,
            zoom: zoom,
            leftUp: [longStartTile, latStartTile],
            lonArea: Math.abs(longStartTileNext - longStartTile),
            latArea: Math.abs(latStartTileNext - latStartTile),
        } as TileInfo;



    }



}





export { GISUtil, LonLatEle, TileInfo };