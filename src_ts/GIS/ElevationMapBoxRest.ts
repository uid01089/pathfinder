import { LonLatEle } from './GISUtil';
import { FeatureCollectionImpl, FeatureCollection } from './FeatureCollection';




class ElevationMapBoxRest {


    public static async getElevation(coordinate: LonLatEle, accessToken: string): Promise<number> {

        const urlElevationNotExactly = 'https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/' + coordinate[0] + "," + coordinate[1] + '.json?&access_token=' + accessToken;
        const response = await fetch(urlElevationNotExactly);
        const elevationFeatures = await response.json() as FeatureCollection;
        const featureCollectionImpl = new FeatureCollectionImpl(elevationFeatures);
        const elevationNotExaclty = featureCollectionImpl.getElevation();

        return elevationNotExaclty;

    }

}

export { ElevationMapBoxRest }