import { TileLayer, Coords, DoneCallback } from 'leaflet';
import { FetchCache } from '../../js_lib/FetchCache';

const CACHE_NAME = "BuildUtil";


class CachedTileLayer extends TileLayer {
    [x: string]: any;


    protected createTile(coords: Coords, done: DoneCallback): HTMLElement {

        const myImg = new Image();
        const src = this.getTileUrl(coords);

        const cacheResponse = FetchCache.fetch(CACHE_NAME, src);
        if (null != cacheResponse) {
            cacheResponse.then((response) => {
                response.clone().blob().then((blob) => {
                    const img = URL.createObjectURL(blob);
                    myImg.src = img;
                    myImg.addEventListener("load", () => { done(null, myImg) });
                    myImg.addEventListener("error", (error) => { done(new Error(), myImg) });
                });

            })
        }

        return myImg;










    }

}



export { CachedTileLayer };