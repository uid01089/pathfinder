import { LonLatEle } from './GISUtil';
import { ElevationMapBoxTile } from './ElevationMapBoxTile';



class Elevation {

    static cache: Map<string, number> = new Map();

    public static async getElevation(coordinate: LonLatEle, accessToken: string): Promise<number> {

        //var worker = new Worker("./ElevationWorker.ts", { type: "module" });

        let key = coordinate.longitude.toFixed(3) + "-" + coordinate.latitude.toFixed(4);
        let elevation = Elevation.cache.get(key);
        if (elevation === undefined) {

            elevation = await ElevationMapBoxTile.getElevation(coordinate, accessToken);

            Elevation.cache.set(key, elevation);


        } else {
            //console.log("Already known");
        }

        return elevation;

    }

}

export { Elevation }