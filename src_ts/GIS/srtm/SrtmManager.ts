import { SrtmDownloader } from "./SrtmDownloader";
import { SrtmDownloaderNase } from "./SrtmDownloaderNase";
import { SrtmDownloaderViewfinderpanoramas } from "./SrtmDownloaderViewfinderpanoramas";
import { LonLatEle } from '../GISUtil';

class SrtmManager {

    private srtmDownloader: SrtmDownloader;

    constructor() {
        this.srtmDownloader = new SrtmDownloaderViewfinderpanoramas();
    }

    public async getElevation(coordinate: LonLatEle): Promise<number> {
        var hgtFile = await this.srtmDownloader.getHgtFile(coordinate);
        var elevation = await hgtFile.getElevation(coordinate);


        return elevation;
    }


}

export { SrtmManager };