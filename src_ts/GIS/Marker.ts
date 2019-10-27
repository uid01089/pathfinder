import { LonLatEle } from "./GpxFile";

interface IMarker {
    lonLatEle: LonLatEle
}

class MarkerImpl implements IMarker {
    lonLatEle: LonLatEle;
    longitude: number;
    latitude: number;
    popup: string;

    constructor(longitude: number, latitude: number, popup?: string) {
        this.longitude = longitude;
        this.latitude = latitude;
        this.lonLatEle = [longitude, latitude];
        this.popup = popup || "";

    }

    getLonLatEle(): LonLatEle {
        return this.lonLatEle;
    }

    getLongitude(): number {
        return this.longitude;
    }

    getLatitude(): number {
        return this.latitude;
    }

    getPopup(): string {
        return this.popup
    }

}

export { IMarker, MarkerImpl };