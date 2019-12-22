import { SrtmDownloader } from "./SrtmDownloader";
import { HgtFile } from './HgtFile';
import { LonLatEle } from '../GISUtil';
import { SrtmUtil } from './SrtmUtil';
import { FetchCache } from '../../lib/FetchCache';
import * as JSZip from 'jszip';
import { SrtmDownloaderBase } from "./SrtmDownloaderBase";

class SrtmDownloaderNase extends SrtmDownloaderBase implements SrtmDownloader {

    private chapters = ['Eurasia', 'Africa', 'Australia', 'Islands', 'North_America', 'South_America'];




    async getHgtFile(point: LonLatEle): Promise<HgtFile> {
        let tileName = SrtmUtil.getTileName(point);
        var hgtFile = this.cache.get(tileName);
        if (undefined == hgtFile) {
            var zipFile = await this.download(tileName);
            var blob = await zipFile.blob();
            var unzipFile = await JSZip.loadAsync(blob);
            var hgtContent = await unzipFile.file(tileName + '.hgt').async("arraybuffer");

            hgtFile = new HgtFile(hgtContent, { latitude: Math.floor(point.latitude), longitude: Math.floor(point.longitude) } as LonLatEle);

            this.cache.set(tileName, hgtFile);
        }


        return hgtFile;
    }


    private async download(tileName: string): Promise<Response> {

        var zipFile: Response = undefined;

        for (var region of this.chapters) {
            var url = `http://dds.cr.usgs.gov/srtm/version2_1/SRTM3/${region}/${tileName}.hgt.zip`;
            try {
                zipFile = await FetchCache.fetch("srtm", url);
                break;
            } catch (e) {
                // Not available, go on
            }

        }

        return zipFile;
    }

}

export { SrtmDownloaderNase };