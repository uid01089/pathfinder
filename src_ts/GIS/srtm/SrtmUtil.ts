import { LonLatEle } from '../GISUtil';
import { Util } from '../../lib/Util';

class SrtmUtil {
    public static getTileName(point: LonLatEle): string {

        // from https://github.com/rapomon/srtm-elevation/blob/master/src/tile-key.js

        var sn = point.latitude < 0 ? 'S' : 'N';
        var snNr = Util.zeroPad(Math.abs(Math.floor(point.latitude)), 2);
        var we = point.longitude < 0 ? 'W' : 'E';
        var weNr = Util.zeroPad(Math.abs(Math.floor(point.longitude)), 3);

        return `${sn}${snNr}${we}${weNr}`;
    }
}

export { SrtmUtil };