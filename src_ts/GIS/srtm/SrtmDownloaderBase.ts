
import { HgtFile } from './HgtFile';

class SrtmDownloaderBase {
    protected cache: Map<string, HgtFile>;

    constructor() {
        this.cache = new Map();
    }

    
}

export { SrtmDownloaderBase }