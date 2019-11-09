import { GeoJSON, LineString, FeatureCollection, Feature, Geometry } from 'geojson';
import { Track } from './GpxFile';
import { GISUtil } from './GISUtil';
import { Elevation } from './Elevation';
import { IMarker } from './Marker';

interface Directions {
    code: string,
    waypoints: Waypoint[],
    routes: Route[]
}


interface Waypoint {
    name: string,
    location: number[],
    distance: number
}

interface Route {
    duration: number,
    distance: number,
    weight_name: string,
    weight: number,
    geometry: LineString,
    legs: Leg[],
    voiceLocale: string
}

interface Leg {
    distance: number,
    duration: number,
    steps: Step[],
    summary: string,
    annotation: Annotation,

}
interface Annotation {
    distance: number,
    duration: number,
    speed: number,
    congestion: string
}

interface Step {

}

class DirectionsImpl implements Directions {

    code: string;
    waypoints: Waypoint[];
    routes: Route[];
    private mapBoxUtil: GISUtil;

    constructor(directions?: Directions) {

        this.code = "";
        this.mapBoxUtil = new GISUtil();
        this.waypoints = directions && directions.waypoints || [];
        this.routes = directions && directions.routes || [{
            geometry: {
                type: "LineString",
                coordinates: []
            } as LineString
        } as Route];
    }

    async complete(accessToken: string, doEvelationCalculation: boolean = true): Promise<DirectionsImpl> {
        if (doEvelationCalculation) {
            await this.addElevations(accessToken);
        }
        this.addDistances();

        return this;
    }

    private async addElevations(accessToken: string) {

        var evaluationPromisses = this.routes[0].geometry.coordinates.map(async (coordinate) => {
            let evaluation = await Elevation.getElevation({ longitude: coordinate[0], latitude: coordinate[1] }, accessToken);
            coordinate[2] = evaluation;
        });

        await Promise.all(evaluationPromisses);
    }

    private addDistances() {
        var coordinates = this.routes[0].geometry.coordinates;
        if (coordinates.length > 1) {
            coordinates[0][3] = 0;
            for (var i = 1; i < coordinates.length; i++) {
                //LonLatEle
                var length = this.mapBoxUtil.distance(coordinates[i - 1][0], coordinates[i - 1][1], coordinates[i - 1][2],
                    coordinates[i][0], coordinates[i][1], coordinates[i][2]);

                coordinates[i][3] = length;
            }
        }
    }




    static async getDirections(markers: IMarker[], accessToken: string): Promise<DirectionsImpl> {
        var coordinates: string = "";
        markers.forEach((marker) => {
            coordinates = coordinates + marker.lonLatEle.longitude + ',' + marker.lonLatEle.latitude + ';'
        });

        let url = 'https://api.mapbox.com/directions/v5/mapbox/walking/' + coordinates.slice(0, -1) + '?steps=true&geometries=geojson&access_token=' + accessToken;
        //let url = 'http://router.project-osrm.org/route/v1/walking/' + coordinates.slice(0, -1) + '?overview=false';


        let response = await fetch(url);
        let directions = await response.json();
        return new DirectionsImpl(directions);

    }

    static async getDirectionsWithoutAutoRouting(markers: IMarker[]): Promise<DirectionsImpl> {

        return new Promise<DirectionsImpl>((resolve, reject) => {
            var directions = DirectionsImpl.getDirectionsWithoutAutoRoutingSync(markers);

            setTimeout(() => {
                resolve(directions);
            }, 1);
        });

    }

    static async getDirectionsFromTrack(track: Track): Promise<DirectionsImpl> {
        return new Promise<DirectionsImpl>((resolve, reject) => {
            var directions = DirectionsImpl.getDirectionsFromTrackSync(track);

            setTimeout(() => {
                resolve(directions);
            }, 1);
        });
    }

    private static getDirectionsFromTrackSync(track: Track): DirectionsImpl {
        var directions = new DirectionsImpl();
        var distance: number = 0;


        track.lonLatEles.forEach((lonLatEles) => {
            var waypoint = { location: [lonLatEles.longitude, lonLatEles.latitude, lonLatEles.elevation], distance: 0 } as Waypoint;
            directions.waypoints.push(waypoint);
            directions.routes[0].geometry.coordinates.push([lonLatEles.longitude, lonLatEles.latitude, lonLatEles.elevation]);
        });

        directions.addDistances();


        return directions;

    }

    private static getDirectionsWithoutAutoRoutingSync(markers: IMarker[]): DirectionsImpl {

        var directions = new DirectionsImpl();
        var distance: number = 0;

        markers.forEach((marker) => {
            var waypoint = { location: [marker.lonLatEle.longitude, marker.lonLatEle.latitude, marker.lonLatEle.elevation], distance: 0 } as Waypoint;
            directions.waypoints.push(waypoint);
            directions.routes[0].geometry.coordinates.push([marker.lonLatEle.longitude, marker.lonLatEle.latitude, marker.lonLatEle.elevation]);
        });

        return directions;

    }

    getCoordinates(): number[][] {
        return this.routes[0].geometry.coordinates;
    }




}

export { Step, Annotation, Leg, Route, Waypoint, Directions, DirectionsImpl };