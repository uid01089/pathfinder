import { LonLatEle } from './GISUtil';

interface ElevationProvider {
    getElevation(coordinate: LonLatEle, accessToken: string): Promise<number>;
}
export { ElevationProvider };