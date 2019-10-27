

const xml2js = require('xml2js');

import { LonLatEle } from './GISUtil';
import { TextUtils } from '../lib/TextUtils';


interface Track {
    lonLatEles: LonLatEle[];
}

// See https://www.topografix.com/GPX/1/1/
class GpxFile {
    private gpx: any;

    constructor(gpxJson: any) {
        this.gpx = gpxJson.gpx;

    }


    getTrks(): Track[] {

        var tracks: Track[] = [];

        (this.gpx.trk).forEach((trk) => {
            var track: Track = { lonLatEles: [] };
            trk.trkseg.forEach((trkseg) => {
                trkseg.trkpt.forEach(trkpt => {
                    var lonLatEle: LonLatEle = [];

                    lonLatEle.push(trkpt.$.lon);
                    lonLatEle.push(trkpt.$.lat);
                    lonLatEle.push(trkpt.ele[0]);

                    track.lonLatEles.push(lonLatEle);
                });
            });

            tracks.push(track);
        });

        return tracks;
    }


    public static async load(file: File): Promise<GpxFile> {
        return new Promise<GpxFile>(async (resolve, reject) => {

            try {


                let gpxContent = await TextUtils.loadText(file);

                var parser = new xml2js.Parser({ async: false });
                parser.parseString(gpxContent, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(new GpxFile(result));
                    }
                });
            } catch (error) {
                reject(error);
            }

        });




    }
}

export { GpxFile, LonLatEle, Track };