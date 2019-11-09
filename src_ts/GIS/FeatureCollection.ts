import { GeoJSON, LineString, FeatureCollection, Feature, Geometry } from 'geojson';
import { Directions } from './Directions'

class FeatureCollectionImpl implements FeatureCollection {


    type: "FeatureCollection";
    features: Feature<Geometry, { [name: string]: any; }>[];

    constructor(featureCollection?: FeatureCollection) {
        this.type = "FeatureCollection";
        this.features = featureCollection && featureCollection.features || [{
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [

                ] as number[][]
            }
        } as Feature];
    }

    getCoordinates(): number[][] {
        return (this.features[0].geometry as LineString).coordinates;
    }

    getElevation(): number {
        var elevation: number = 0;
        this.features.forEach((feature) => {
            var currentElevation = (feature.properties as any).ele;
            if ((currentElevation !== undefined) && (typeof currentElevation === 'number') && (currentElevation != null)) {
                if (currentElevation > elevation) {
                    elevation = currentElevation;
                }
            }
        });

        /*
        if (elevation == 0) {
            console.log(this.features);
        }
        */

        return elevation;
    }

    clear() {
        this.features = [{
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [

                ] as number[][]
            }
        } as Feature];
    }


    static getFeatureCollection(directions?: Directions): FeatureCollectionImpl {
        var featureCollection = new FeatureCollectionImpl();
        if (directions != null) {

            // direction available, update geojson
            directions.routes[0].geometry.coordinates.forEach((coordinate) => {
                (featureCollection.features[0].geometry as LineString).coordinates.push(coordinate);

            });
        }

        return featureCollection;
    }



}

export { FeatureCollectionImpl, FeatureCollection };