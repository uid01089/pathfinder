import { TileLayer, Coords, DoneCallback } from 'leaflet';
import { FetchCache } from '../../lib/FetchCache';

const CACHE_NAME = "CACHED_TILE_LAYERS";


class CachedTileLayer extends TileLayer {
    [x: string]: any;


    protected createTile(coords: Coords, done: DoneCallback): HTMLElement {

        const myImg = new Image();
        var src = this.getTileUrl(coords);

        var cacheResponse = FetchCache.fetch(CACHE_NAME, src);
        if (null != cacheResponse) {
            cacheResponse.then((response) => {
                response.clone().blob().then((blob) => {
                    var img = URL.createObjectURL(blob);
                    myImg.src = img;
                    myImg.addEventListener("load", () => { done(null, myImg) });
                    myImg.addEventListener("error", (error) => { done(new Error(), myImg) });




                    //return super.createTile(coords, done);
                });

            })
        }

        return myImg;










    }

}



export { CachedTileLayer };