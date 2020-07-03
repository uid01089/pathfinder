import { LonLatEle } from './GISUtil';

interface ElevationProvider {
    getElevation(coordinate: LonLatEle, accessToken: string, zoom: number): Promise<number>;
}
export { ElevationProvider };