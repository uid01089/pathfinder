import { LonLatEle } from './GISUtil';
import { FeatureCollectionImpl, FeatureCollection } from './FeatureCollection';




class ElevationMapBoxRest {


    public static async getElevation(coordinate: LonLatEle, accessToken: string): Promise<number> {

        let urlElevationNotExactly = 'https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/' + coordinate[0] + "," + coordinate[1] + '.json?&access_token=' + accessToken;
        let response = await fetch(urlElevationNotExactly);
        var elevationFeatures = await response.json() as FeatureCollection;
        var featureCollectionImpl = new FeatureCollectionImpl(elevationFeatures);
        var elevationNotExaclty = featureCollectionImpl.getElevation();

        return elevationNotExaclty;

    }

}

export { ElevationMapBoxRest }