import { LonLatEle } from './GISUtil';
import { GISUtil, TileInfo } from './GISUtil';
import { PictureUtil } from '../lib/PictureUtil';
import { ElevationProvider } from './ElevationProvider';
import { Util } from '../lib/Util';
import { Pixel, Picture } from '../lib/Picture';



class ElevationMapBoxTile implements ElevationProvider {

    static cache: Map<string, Picture> = new Map();



    public async getElevation(coordinate: LonLatEle, accessToken: string): Promise<number> {

        //var worker = new Worker("./ElevationWorker.ts", { type: "module" });


        // Retrieve picture with elevation coded as RGB
        const zoom = 10;
        const mapBoxUtil = new GISUtil();
        const tailInfo = mapBoxUtil.getTailInfo(coordinate.longitude, coordinate.latitude, zoom);
        const url = 'https://api.mapbox.com/v4/mapbox.terrain-rgb/' + zoom + '/' + tailInfo.xTile + '/' + tailInfo.yTile + '.pngraw?access_token=' + accessToken;

        const image = await PictureUtil.load(url);


        // Calculate x,y-pixel for this picture

        const latitudePicturePixel = image.height;
        const longitutdePicturePixel = image.width;

        const x = Math.trunc(longitutdePicturePixel * Math.abs(coordinate.longitude - tailInfo.leftUp.longitude) / tailInfo.lonArea);
        const y = Math.trunc(latitudePicturePixel * Math.abs(coordinate.latitude - tailInfo.leftUp.latitude) / tailInfo.latArea);

        // Just for find out how far the input data can be simplified
        //var deltaLong = tailInfo.lonArea / longitutdePicturePixel; // 0.001
        //var deltaLat = tailInfo.latArea / latitudePicturePixel; // 0.0008

        //var numberAfterCommaLong = Util.getNumberOfDigitsAfterComma(deltaLong) + 1;
        //var numberAfterCommaLat = Util.getNumberOfDigitsAfterComma(deltaLat) + 1;

        //var xLimit = Util.round(x, numberAfterCommaLong);
        //var yLimit = Util.round(y, numberAfterCommaLat);


        let picture = ElevationMapBoxTile.cache.get(url);
        if (picture === undefined) {
            //console.log("Have to calculate " + url);

            picture = new Picture(url);

            ElevationMapBoxTile.cache.set(url, picture);
        } else {
            //console.log("Have it already");
        }

        // Calculate elevation from pixel
        const picturePixel = await picture.getPixel(x, y);
        const elevation = -10000 + ((picturePixel.R * 256 * 256 + picturePixel.G * 256 + picturePixel.B) * 0.1);



        return elevation;

    }

}

export { ElevationMapBoxTile }