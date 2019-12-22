import { HgtFile } from './HgtFile';
import { LonLatEle } from '../GISUtil';

interface SrtmDownloader {

    getHgtFile(point: LonLatEle): Promise<HgtFile>;


}

export { SrtmDownloader };