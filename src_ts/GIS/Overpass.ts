// http://overpass-api.de/api/interpreter/?data=
//(node[amenity=parking](bbox);way[amenity=parking](bbox);rel[amenity=parking](bbox););
//(._;%3E;);out%20center;&bbox=13.015350963917,49.018008339548,13.183922436083,49.115631273156

/*


https://www.overpass-api.de/api/interpreter?data=[out:json];node[highway=speed_camera](43.46669501043081,-5.708215989569187,43.588927989569186,-5.605835010430813);out%20meta;
https://www.overpass-api.de/api/interpreter?data=[out:json][timeout:25];(node[%22amenity%22=%22parking%22](9.7283935546875,48.45288728338137,14.342651367187502,50.16634316943975););out%20body;

https://www.overpass-api.de/api/interpreter?data=%5Bout:json%5D%5Btimeout:25%5D;(node%5B%22amenity%22=%22parking%22%5D(9.7283935546875,48.45288728338137,14.342651367187502,50.16634316943975);way%5B%22amenity%22=%22parking%22%5D(9.7283935546875,48.45288728338137,14.342651367187502,50.16634316943975));relation%5B%22amenity%22=%22parking%22%5D(9.7283935546875,48.45288728338137,14.342651367187502,50.16634316943975)););out%20body;
encodeURIComponent(uri)


https://www.overpass-api.de/api/interpreter?data=%5Bout:json%5D%5Btimeout:25%5D;(node%5B%22amenity%22=%22parking%22%5D(9.7283935546875,48.45288728338137,14.342651367187502,50.16634316943975);
                                                                                  way%5B%22amenity%22=%22parking%22%5D(9.7283935546875,48.45288728338137,14.342651367187502,50.16634316943975);
                                                                                  relation%5B%22amenity%22=%22parking%22%5D(9.7283935546875,48.45288728338137,14.342651367187502,50.16634316943975);
                                                                                );out%20body;


https://www.overpass-api.de/api/interpreter?data=%5Bout:json%5D%5Btimeout:25%5D;(node%5B%22amenity%22=%22parking%22%5D(9.7283935546875,48.45288728338137,14.342651367187502,50.16634316943975);
                                                                                  way%5B%22amenity%22=%22parking%22%5D(9.7283935546875,48.45288728338137,14.342651367187502,50.16634316943975);
                                                                                  relation%5B%22amenity%22=%22parking%22%5D(9.7283935546875,48.45288728338137,14.342651367187502,50.16634316943975);
                                                                                );out%20center;


http://overpass-api.de/api/interpreter/?data=(node[amenity=parking](bbox);way[amenity=parking](bbox);rel[amenity=parking](bbox););(._;%3E;);out%20center;&bbox=13.015350963917,49.02076448323,13.183922436083,49.112876444678



http://overpass-api.de/api/interpreter/?data=(node[amenity=parking](bbox);way[amenity=parking](bbox);rel[amenity=parking](bbox););(._;%3E;);out%20center;&bbox=13.015350963917,49.02076448323,13.183922436083,49.112876444678

http://overpass-api.de/api/interpreter


[out: json][timeout: 25];
// gather results
(
    node["amenity" = "parking"]({{ bbox }});
way["amenity" = "parking"]({{ bbox }});
relation["amenity" = "parking"]({{ bbox }});
);
// print results
out body;
>;
out skel qt;


http://overpass-api.de/api/interpreter/?data=[(node[amenity=parking](bbox);way[amenity=parking](bbox);rel[amenity=parking](bbox););(._;%3E;);out%20center;&bbox=13.015350963917,49.02076448323,13.183922436083,49.112876444678



&bbox=13.015350963917,49.02076448323,13.183922436083,49.112876444678


*/




import { GeoJSON, LineString, FeatureCollection, Feature, Geometry } from 'geojson';
import { LonLatEle } from './GISUtil';
import * as L from 'leaflet';
import { Mutex, UnlockFct } from '../lib/Mutex';
import { BoundingBox } from './BoundingBox';
import { MarkerImpl } from './Marker';




class Overpass extends L.Layer {
    mutex: Mutex;
    responses: Map<BoundingBox, Array<MarkerImpl>>;
    leafletMarkers: Array<L.Marker>;
    minZoom: number;
    icon: string;
    query: string;
    paintNewMapFct: L.LeafletEventHandlerFn;

    constructor(minZoom: number, icon: string, query: string) {
        super();

        this.mutex = new Mutex;
        this.responses = new Map();
        this.leafletMarkers = [];
        this.minZoom = minZoom;
        this.icon = icon;
        this.query = query;
        this.paintNewMapFct = null;
    }


    onRemove(map: L.Map): this {
        if (null != this.paintNewMapFct) {
            map.removeEventListener('moveend', this.paintNewMapFct);
            this.paintNewMapFct = null;
        }

        this.deleteMarker();

        return this;
    }

    onAdd(map: L.Map): this {
        this._map = map;
        this.paintNewMap(map);

        this.paintNewMapFct = ((e) => { this.paintNewMap(map); });

        /*
        map.addEventListener('moveend', (e) => {
        this.paintNewMap(map);
        }); */

        map.addEventListener('moveend', this.paintNewMapFct);
        return this;
    }





    private paintNewMap(map: L.Map) {
        if (map.getZoom() >= this.minZoom) {
            const boundingBox = new BoundingBox(map.getBounds().getSouthWest().lng, map.getBounds().getSouthWest().lat, map.getBounds().getNorthEast().lng, map.getBounds().getNorthEast().lat);
            const dataPromise = this.request(boundingBox, this.query);
            dataPromise.then((markers: Array<MarkerImpl>) => {
                this.deleteMarker();
                markers.forEach((marker) => {
                    if (boundingBox.isPointIncluded(marker.getLonLatEle())) {
                        const icon = L.icon({
                            iconUrl: this.icon,
                            //shadowUrl: 'marker-shadow.png',
                            iconSize: [25, 41],
                            shadowSize: [41, 41],
                            iconAnchor: [12, 41],
                            //shadowAnchor: [4, 62],  // the same for the shadow
                            popupAnchor: [1, -34] // point from which the popup should open relative to the iconAnchor
                        });
                        const leafletMarker = new L.Marker({ lat: marker.getLatitude(), lng: marker.getLongitude() }, {
                            icon: icon
                        });
                        leafletMarker.bindPopup(marker.getPopup());
                        this.leafletMarkers.push(leafletMarker);
                    }
                });
                if (this.leafletMarkers.length < 200) {
                    this.leafletMarkers.forEach((marker) => { marker.addTo(map); });
                }
                else {
                    console.log("Too many markers within the bounding box!");
                    this.deleteMarker();
                }
            });
        }
        else {
            this.deleteMarker();
        }
    }

    private deleteMarker() {
        this.leafletMarkers.forEach((marker) => {
            marker.remove();

        });
        this.leafletMarkers = [];
    }


    private searchResponse(boundBox: BoundingBox): Array<MarkerImpl> {

        let foundResponse = undefined;

        this.responses.forEach((response, bbox) => {
            if (bbox.isBoxIncluded(boundBox)) {
                foundResponse = response;
            }
        });

        return foundResponse;
    }

    private json2Marker(json: any): Array<MarkerImpl> {
        const markers = new Array<MarkerImpl>();
        json.elements.forEach((object) => {
            const center = object.center;
            if (center != undefined) {

                let popupString = "";
                if (object.tags != undefined) {

                    popupString = `<b>name: </b> ${object.tags.name}<br>
                    <b>access: </b> ${object.tags.access}<br>
                    <b>fee: </b> ${object.tags.fee}<br>
                    <b>operator: </b> ${object.tags.operator}<br>
                    <b>parking: </b> ${object.tags.parking}<br>
                    <b>surface: </b> ${object.tags.surface}<br>`;
                }
                markers.push(new MarkerImpl(center.lon, center.lat, popupString));

            }

        })

        return markers;
    }

    async request(box: BoundingBox, query: string): Promise<any> {

        return new Promise<any>(async (resolve, reject) => {
            let release: UnlockFct;

            const boxString = box.southWest.longitude + "," + box.southWest.latitude + "," + box.northEast.longitude + "," + box.northEast.latitude;
            const url = (`http://overpass-api.de/api/interpreter/?data=[out:json][timeout:25];(node[${query}](bbox);way[${query}](bbox);rel[${query}](bbox););(._;%3E;);out%20center;&bbox=${boxString}`);

            try {
                release = await this.mutex.lock();

                let data = this.searchResponse(box);

                if (data === undefined) {
                    const response = await fetch(url);
                    const json = await response.json();
                    if (json.elements.length > 0) {
                        data = this.json2Marker(json);
                        this.responses.set(box, data);
                    } else {
                        reject("too many elements " + json.elements.length);
                    }
                }

                if (data != undefined) {

                    //TODO



                    resolve(data);
                } else {
                    reject("Error in retrieving");
                }

            } catch (e) {
                console.log(e);
                reject(e);
            } finally {
                release();
            }
        }
        );
    }

}

export { Overpass, BoundingBox, LonLatEle };