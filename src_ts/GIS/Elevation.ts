import { LonLatEle } from './GISUtil';
import { ElevationMapBoxTile } from './ElevationMapBoxTile';
import { SrtmManager } from './srtm/SrtmManager';
import { ElevationProvider } from './ElevationProvider';



class Elevation implements ElevationProvider {

    static cache: Map<string, number> = new Map();
    private elevationProviders: ElevationProvider[] = [];

    constructor() {
        this.elevationProviders.push(new SrtmManager());
        this.elevationProviders.push(new ElevationMapBoxTile());
    }



    public async getElevation(coordinate: LonLatEle, accessToken: string): Promise<number> {

        //var worker = new Worker("./ElevationWorker.ts", { type: "module" });

        let key = coordinate.longitude.toFixed(5) + "-" + coordinate.latitude.toFixed(5);
        let elevation = Elevation.cache.get(key);
        if (elevation === undefined) {

            for (var elevationProvider of this.elevationProviders) {
                try {
                    elevation = await elevationProvider.getElevation(coordinate, accessToken);

                    // We were successful, break
                    break;
                } catch (error) {
                    // error, try the next possibility
                }
            }

            if (elevation === undefined) {
                throw new Error("Elevation can not be determined");
            }

            Elevation.cache.set(key, elevation);


        } else {
            //console.log("Already known");
        }

        return elevation;

    }

}

export { Elevation }