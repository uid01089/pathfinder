import { LonLatEle } from './GISUtil';
import { ElevationMapBoxTile } from './ElevationMapBoxTile';
import { SrtmManager } from './srtm/SrtmManager';



class Elevation {

    static cache: Map<string, number> = new Map();
    static srtmManager = new SrtmManager();

    public static async getElevation(coordinate: LonLatEle, accessToken: string): Promise<number> {

        //var worker = new Worker("./ElevationWorker.ts", { type: "module" });

        let key = coordinate.longitude.toFixed(5) + "-" + coordinate.latitude.toFixed(5);
        let elevation = Elevation.cache.get(key);
        if (elevation === undefined) {

            //elevation = await ElevationMapBoxTile.getElevation(coordinate, accessToken);
            elevation = await Elevation.srtmManager.getElevation(coordinate);

            Elevation.cache.set(key, elevation);


        } else {
            //console.log("Already known");
        }

        return elevation;

    }

}

export { Elevation }