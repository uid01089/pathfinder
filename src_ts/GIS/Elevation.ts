import { LonLatEle } from './GISUtil';
import { FeatureCollectionImpl, FeatureCollection } from './FeatureCollection';
import { GISUtil, TileInfo } from './GISUtil';
import { PictureUtil } from '../lib/PictureUtil';


class Elevation {

    static cache: Map<string, number> = new Map();

    public static async getElevation(coordinate: LonLatEle, accessToken: string): Promise<number> {

        let key = coordinate.longitude.toFixed(3) + "-" + coordinate.latitude.toFixed(4);
        let elevation = Elevation.cache.get(key);
        if (elevation === undefined) {
            /*
            let urlElevationNotExactly = 'https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/' + coordinate[0] + "," + coordinate[1] + '.json?&access_token=' + accessToken;
            let response = await fetch(urlElevationNotExactly);
            var elevationFeatures = await response.json() as FeatureCollection;
            var featureCollectionImpl = new FeatureCollectionImpl(elevationFeatures);
            var elevationNotExaclty = featureCollectionImpl.getElevation();

            */



            // Do it by myself

            // Retrieve picture with elevation coded as RGB
            const zoom = 10;
            var mapBoxUtil = new GISUtil();
            var tailInfo = mapBoxUtil.getTailInfo(coordinate.longitude, coordinate.latitude, zoom);
            let url = 'https://api.mapbox.com/v4/mapbox.terrain-rgb/' + zoom + '/' + tailInfo.xTile + '/' + tailInfo.yTile + '.pngraw?access_token=' + accessToken;

            var image = await PictureUtil.load(url);
            var canvas = PictureUtil.imageToCanvas(image);

            // Calculate x,y-pixel for this picture

            var latitudePicturePixel = image.height;
            var longitutdePicturePixel = image.width;

            var x = longitutdePicturePixel * Math.abs(coordinate.longitude - tailInfo.leftUp.longitude) / tailInfo.lonArea;
            var y = latitudePicturePixel * Math.abs(coordinate.latitude - tailInfo.leftUp.latitude) / tailInfo.latArea;

            // Just for find out how far the input data can be simplified
            var deltaLong = tailInfo.lonArea / longitutdePicturePixel; // 0.001
            var deltaLat = tailInfo.latArea / latitudePicturePixel; // 0.0008

            var pixel = PictureUtil.getPixelFromCanvas(canvas, x, y);

            // Calculate elevation from pixel
            elevation = -10000 + ((pixel[0] * 256 * 256 + pixel[1] * 256 + pixel[2]) * 0.1)

            //console.log(elevation + "-" + elevationNotExaclty + ":" + deltaLong + ":" + deltaLat);

            Elevation.cache.set(key, elevation);


        } else {
            //console.log("Already known");
        }

        return elevation;

    }

}

export { Elevation }