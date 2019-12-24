import { LonLatEle } from './GISUtil';
import { GISUtil, TileInfo } from './GISUtil';
import { PictureUtil } from '../lib/PictureUtil';
import { ElevationProvider } from './ElevationProvider';



class ElevationMapBoxTile implements ElevationProvider {

    static cache: Map<string, number> = new Map();

    public async getElevation(coordinate: LonLatEle, accessToken: string): Promise<number> {

        //var worker = new Worker("./ElevationWorker.ts", { type: "module" });


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
        var elevation = -10000 + ((pixel[0] * 256 * 256 + pixel[1] * 256 + pixel[2]) * 0.1)

        return elevation;

    }

}

export { ElevationMapBoxTile }