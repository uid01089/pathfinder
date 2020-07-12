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
        const tileName = SrtmUtil.getTileName(point);
        let hgtFile = this.cache.get(tileName);
        if (undefined == hgtFile) {

            const zipFile = await this.download(tileName);
            const blob = await zipFile.blob();
            if (blob.size != 0) {

                const unzipFile = await JSZip.loadAsync(blob);
                const hgtContent = await unzipFile.file(tileName + '.hgt').async("arraybuffer");

                hgtFile = new HgtFile(hgtContent, { latitude: Math.floor(point.latitude), longitude: Math.floor(point.longitude) } as LonLatEle);

                this.cache.set(tileName, hgtFile);
            } else {
                throw new Error("Blob is empty");
            }

        }


        return hgtFile;
    }


    private async download(tileName: string): Promise<Response> {

        let zipFile: Response = undefined;

        for (const region of this.chapters) {
            const url = `http://dds.cr.usgs.gov/srtm/version2_1/SRTM3/${region}/${tileName}.hgt.zip`;
            try {
                zipFile = await FetchCache.fetch("srtm", url);
                break;
            } catch (e) {
                // Not available, go on
            }

        }

        if (zipFile === undefined) {
            throw new Error("No zipfile fetched");
        }

        return zipFile;
    }

}

export { SrtmDownloaderNase };