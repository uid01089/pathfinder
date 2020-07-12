import { SrtmDownloader } from "./SrtmDownloader";
import { SrtmDownloaderNase } from "./SrtmDownloaderNase";
import { SrtmDownloaderViewfinderpanoramas } from "./SrtmDownloaderViewfinderpanoramas";
import { LonLatEle } from '../GISUtil';
import { ElevationProvider } from "../ElevationProvider";

class SrtmManager implements ElevationProvider {

    private srtmDownloader: SrtmDownloader[] = [];

    constructor() {
        this.srtmDownloader.push(new SrtmDownloaderViewfinderpanoramas());
        this.srtmDownloader.push(new SrtmDownloaderNase());

    }

    public async getElevation(coordinate: LonLatEle, accessToken: string): Promise<number> {

        let elevation = undefined;

        // Use of method caused by async
        for (const srtmDownloader of this.srtmDownloader) {
            try {
                const hgtFile = await srtmDownloader.getHgtFile(coordinate);
                elevation = await hgtFile.getElevation(coordinate);

                // We were successful, break
                break;
            } catch (error) {
                // Error happens, try the next Downloader
            }

        }

        if (elevation === undefined) {
            throw new Error("No elevation available");
        }

        return elevation;
    }


}

export { SrtmManager };