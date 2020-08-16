

import { Parser, Builder } from 'xml2js';

import { LonLatEle } from './GISUtil';
import { TextUtils } from '../js_lib/TextUtils';
import { IMarker } from './Marker';


interface Track {
    lonLatEles: LonLatEle[];
}

interface GPXTrkPtLeaf {
    lon: number;
    lat: number;
}

interface GPXTrkPt {
    $: GPXTrkPtLeaf;
    ele: number[];
}

interface GPXSeg {
    trkpt: GPXTrkPt[];
}
interface GPXTrack {
    trkseg: GPXSeg[];
}

interface GPX {
    trk: GPXTrack[];
}

interface GPXJSON {
    gpx?: GPX;
}

// See https://www.topografix.com/GPX/1/1/
class GpxFile {
    private gpxJson: GPXJSON;

    constructor(gpxJson: GPXJSON) {
        this.gpxJson = gpxJson;

    }

    public getGpxJson(): GPXJSON {
        return this.gpxJson;
    }

    getTrks(): Track[] {

        const tracks: Track[] = [];

        (this.gpxJson.gpx.trk).forEach((trk) => {
            const track: Track = { lonLatEles: [] };
            trk.trkseg.forEach((trkseg) => {
                trkseg.trkpt.forEach(trkpt => {
                    track.lonLatEles.push({ longitude: trkpt.$.lon, latitude: trkpt.$.lat, elevation: trkpt.ele[0] });
                });
            });

            tracks.push(track);
        });

        return tracks;
    }

    addTrks(trkPoints: IMarker[]): void {

        const trkpts: GPXTrkPt[] = [];
        trkPoints.forEach((trkpt) => {
            if (undefined !== trkpt.lonLatEle.elevation) {
                trkpts.push({
                    $: {
                        lat: trkpt.lonLatEle.latitude,
                        lon: trkpt.lonLatEle.longitude
                    },
                    ele: [trkpt.lonLatEle.elevation]
                });
            } else {
                trkpts.push({
                    $: {
                        lat: trkpt.lonLatEle.latitude,
                        lon: trkpt.lonLatEle.longitude
                    },
                    ele: []
                });
            }

        });



        let gpx = this.gpxJson.gpx;

        if (undefined === gpx) {
            gpx = { trk: [] };
            this.gpxJson.gpx = gpx;
        }

        gpx.trk.push({ trkseg: [{ trkpt: trkpts }] });


    }


    public static async load(file: File): Promise<GpxFile> {
        return new Promise<GpxFile>((resolve, reject) => {

            try {

                const gpxContentPromise = TextUtils.loadText(file);
                gpxContentPromise.then((gpxContent) => {

                    const parser = new Parser({ async: false });
                    parser.parseString(gpxContent, (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(new GpxFile(result));
                        }
                    });

                });
            } catch (error) {
                reject(error);
            }

        });

    }

    public static save(fileName: string, markers: IMarker[]): void {
        const gpxFile = new GpxFile({});
        gpxFile.addTrks(markers);
        const gpxJson = gpxFile.getGpxJson();
        const builder = new Builder();
        const xml = builder.buildObject(gpxJson);

        TextUtils.saveText(fileName, xml);

    }
}

export { GpxFile, LonLatEle, Track };