import { LonLatEle } from '../GISUtil';
import { Util } from '../../lib/Util';

class SrtmUtil {
    public static getTileName(point: LonLatEle): string {

        // from https://github.com/rapomon/srtm-elevation/blob/master/src/tile-key.js

        const sn = point.latitude < 0 ? 'S' : 'N';
        const snNr = Util.zeroPad(Math.abs(Math.floor(point.latitude)), 2);
        const we = point.longitude < 0 ? 'W' : 'E';
        const weNr = Util.zeroPad(Math.abs(Math.floor(point.longitude)), 3);

        return `${sn}${snNr}${we}${weNr}`;
    }
}

export { SrtmUtil };