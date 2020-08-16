import { AbstractReducer, Action } from '../js_web_comp_lib/AbstractReducer';
import { State, reduxStoreInstance } from '../ReduxStore';
import { DirectionsImpl } from '../GIS/Directions';
import { GISUtil } from '../GIS/GISUtil';
import { GpxFile, LonLatEle, Track } from '../GIS/GpxFile';
import { Elevation } from '../GIS/Elevation';
import { IMarker } from '../GIS/Marker';
import { BoxZoomHandler } from 'mapbox-gl';
import { Util } from '../js_lib/Util';



const MAP_MAIN_OPEN_GPX_FILE = "MAP_MAIN_OPEN_GPX_FILE";
const MAP_MAIN_SAVE_GPX_FILE = "MAP_MAIN_SAVE_GPX_FILE";
const MAP_MAIN_SET_DIRECTIONS = "MAP_MAIN_SET_DIRECTIONS";
const MAP_MAIN_ADD_MARKER = "MAP_MAIN_ADD_MARKER";
const MAP_MAIN_CHANGE_MARKER = "MAP_MAIN_CHANGE_MARKER";
const MAP_MAIN_DELETE_MARKER = "MAP_MAIN_DELETE_MARKER";
const MAP_MAIN_DELETE_ALL_MARKERS = "MAP_MAIN_DELETE_ALL_MARKERS";
const MAP_MAIN_SET_CENTER = "MAP_MAIN_SET_CENTER";
const MAP_MAIN_COMPLETE_DIRECTIONS = "MAP_MAIN_COMPLETE_DIRECTIONS";
const MAP_MAIN_TOGGLE_AUTO_ROUTE = "MAP_MAIN_TOGGLE_AUTO_ROUTE";




interface ActionSetCenter extends Action {
    center: LonLatEle;
}
interface ActionOpenGpxFile extends Action {
    files: FileList,
    zoom: number,
}
interface ActionSaveGpxFile extends Action {
    fileName: string,
    markers: IMarker[]
}
interface ActionSetDirections extends Action {
    directions: DirectionsImpl;
    doEvelationCalculation: boolean;
    zoom: number;
}
interface ActionAddMarkers extends Action {
    marker: IMarker;
    zoom: number;
}
interface ActionChangeMarkers extends Action {
    marker: IMarker;
    index: number;
    zoom: number;
}
interface ActionDeleteMarkers extends Action {
    marker: IMarker;
    index: number;
    zoom: number;
}
interface ActionDeleteAllMarkers extends Action {
    zoom: number
}

interface ActionToggleAutoRoute extends Action {
    state: boolean;
    zoom: number;
}

interface ActionCompleteDirection extends Action {
    directions: DirectionsImpl
}

class RedMapMain extends AbstractReducer<State> {
    private mapBoxUtil: GISUtil;

    constructor() {
        super(reduxStoreInstance);

        this.mapBoxUtil = new GISUtil();

    }

    reducer(state: State, action: Action): State {

        switch (action.type) {


            case MAP_MAIN_OPEN_GPX_FILE:
                {
                    const actionReadIn: ActionOpenGpxFile = action as ActionOpenGpxFile;
                    const files = actionReadIn.files;

                    Array.from(files).forEach((file) => {


                        const gpxFilePromise = GpxFile.load(file);

                        gpxFilePromise.then((gpxFile) => {
                            const tracks = gpxFile.getTrks();


                            // Add a direction with values from track 0
                            this.setDirectionsByTrack(tracks[0], actionReadIn.zoom);

                            // Set Map center to the first marker
                            this.setCenter(tracks[0].lonLatEles[0]);


                        }).catch((error) => {
                            console.warn(error);
                        })
                    })


                    const newState = Util.cloneObject<State>(state);
                    newState.action = actionReadIn.type;


                    // Delete all markers and tracks
                    newState.markers = [];

                    return newState;
                }

            case MAP_MAIN_SAVE_GPX_FILE:
                {
                    const actionSaveGpxFile: ActionSaveGpxFile = action as ActionSaveGpxFile;
                    const fileName = actionSaveGpxFile.fileName;
                    const markers = actionSaveGpxFile.markers;

                    GpxFile.save(fileName, markers);

                    const newState = Util.cloneObject<State>(state);
                    newState.action = actionSaveGpxFile.type;



                    return newState;
                }

            case MAP_MAIN_TOGGLE_AUTO_ROUTE:
                {
                    const actionToogleAutoRoute: ActionToggleAutoRoute = action as ActionToggleAutoRoute;


                    const newState = Util.cloneObject<State>(state);
                    newState.action = actionToogleAutoRoute.type;

                    newState.programSetting.autoRouting = actionToogleAutoRoute.state;

                    // Trigger route calculation
                    this.setDirectionsByMarkers(newState.markers, newState.programSetting.autoRouting, newState.programSetting.accessToken, actionToogleAutoRoute.zoom);


                    return newState;
                }

            case MAP_MAIN_SET_DIRECTIONS:
                {
                    const actionSetDirections: ActionSetDirections = action as ActionSetDirections;

                    const newState = Util.cloneObject<State>(state);
                    newState.action = actionSetDirections.type;
                    newState.directions = actionSetDirections.directions;

                    if (typeof newState.directions !== 'undefined' && newState.directions != null) {
                        this.completeDirections(newState.directions, newState.programSetting.accessToken, actionSetDirections.doEvelationCalculation, actionSetDirections.zoom);
                    }

                    return newState;
                }

            case MAP_MAIN_COMPLETE_DIRECTIONS:
                {
                    const actionCompleteDirections: ActionCompleteDirection = action as ActionCompleteDirection;

                    const newState = Util.cloneObject<State>(state);
                    newState.action = actionCompleteDirections.type;
                    newState.directions = actionCompleteDirections.directions;

                    return newState;
                }

            case MAP_MAIN_ADD_MARKER:
                {
                    const actionAddMarker: ActionAddMarkers = action as ActionAddMarkers;
                    const marker = actionAddMarker.marker;

                    const newState = Util.cloneObject<State>(state);
                    newState.action = actionAddMarker.type;

                    newState.markers.push(marker);

                    // Trigger route calculation
                    this.setDirectionsByMarkers(newState.markers, newState.programSetting.autoRouting, newState.programSetting.accessToken, actionAddMarker.zoom);

                    return newState;
                }

            case MAP_MAIN_DELETE_ALL_MARKERS:
                {
                    const actionDeleteAllMarker: ActionDeleteAllMarkers = action as ActionDeleteAllMarkers;


                    const newState = Util.cloneObject<State>(state);
                    newState.action = actionDeleteAllMarker.type;

                    newState.markers = [];

                    // Trigger route calculation
                    this.setDirectionsByMarkers(newState.markers, newState.programSetting.autoRouting, newState.programSetting.accessToken, actionDeleteAllMarker.zoom);

                    return newState;
                }

            case MAP_MAIN_CHANGE_MARKER: {
                const actionChangeMarker: ActionChangeMarkers = action as ActionChangeMarkers;
                const marker = actionChangeMarker.marker;
                const index = actionChangeMarker.index;

                const newState = Util.cloneObject<State>(state);
                newState.action = actionChangeMarker.type;

                newState.markers[index] = marker;

                // Trigger route calculation
                this.setDirectionsByMarkers(newState.markers, newState.programSetting.autoRouting, newState.programSetting.accessToken, actionChangeMarker.zoom);

                return newState;
            }

            case MAP_MAIN_DELETE_MARKER:
                {
                    const actionDeleteMarker: ActionDeleteMarkers = action as ActionDeleteMarkers;
                    const marker = actionDeleteMarker.marker;
                    const index = actionDeleteMarker.index;


                    const newState = Util.cloneObject<State>(state);
                    newState.action = actionDeleteMarker.type;

                    newState.markers.splice(index, 1);

                    // Trigger route calculation
                    this.setDirectionsByMarkers(newState.markers, newState.programSetting.autoRouting, newState.programSetting.accessToken, actionDeleteMarker.zoom);

                    return newState;
                }

            case MAP_MAIN_SET_CENTER:
                {
                    const actionSetCenter: ActionSetCenter = action as ActionSetCenter;



                    const newState = Util.cloneObject<State>(state);
                    newState.action = actionSetCenter.type;
                    newState.center = actionSetCenter.center;


                    return newState;
                }
            default: return state;
        }

    }


    openGpxFile(files: FileList, zoom: number): void {


        const action: ActionOpenGpxFile = {
            type: MAP_MAIN_OPEN_GPX_FILE,
            files: files,
            zoom: zoom,
        }
        this.store.dispatchAction(action);





    }
    saveGpxFile(file: string, markers: IMarker[]): void {
        const action: ActionSaveGpxFile = {
            type: MAP_MAIN_SAVE_GPX_FILE,
            fileName: file,
            markers: markers
        }
        this.store.dispatchAction(action);
    }


    addMarker(markerToBeAdded: IMarker, zoom: number): void {
        const action: ActionAddMarkers = {
            type: MAP_MAIN_ADD_MARKER,
            marker: markerToBeAdded,
            zoom: zoom
        }
        this.store.dispatchAction(action);
    }

    changeMarker(index: number, marker: IMarker, zoom: number): void {
        const action: ActionChangeMarkers = {
            type: MAP_MAIN_CHANGE_MARKER,
            marker: marker,
            index: index,
            zoom: zoom
        }
        this.store.dispatchAction(action);
    }

    deleteMarker(index: number, markerToBeDeleted: IMarker, zoom: number): void {
        const action: ActionDeleteMarkers = {
            type: MAP_MAIN_DELETE_MARKER,
            marker: markerToBeDeleted,
            index: index,
            zoom: zoom
        }
        this.store.dispatchAction(action);
    }

    setDirectionsByTrack(track: Track, zoom: number): void {
        const actionFct = async (dispatch) => {
            const directionsPromise = DirectionsImpl.getDirectionsFromTrack(track);
            directionsPromise.then(
                (directions: DirectionsImpl) => dispatch({
                    type: MAP_MAIN_SET_DIRECTIONS,
                    directions: directions,
                    doEvelationCalculation: false,
                    zoom: zoom,


                } as ActionSetDirections),

                error => dispatch({
                    type: "ERROR"
                })
            );
        }
        this.store.dispatch(actionFct);

    }

    completeDirections(directions: DirectionsImpl, accessToken: string, doEvelationCalculation = true, zoom: number): void {
        const actionFct = async (dispatch) => {
            const directionsCompletedPromise = directions.complete(accessToken, doEvelationCalculation, zoom);

            directionsCompletedPromise.then((directionsCompleted) => {
                const action: ActionCompleteDirection = {
                    type: MAP_MAIN_COMPLETE_DIRECTIONS,
                    directions: directionsCompleted
                };
                dispatch(action);

            })

        }
        this.store.dispatch(actionFct);
    }

    setDirectionsByMarkers(markers: IMarker[], autoRouting: boolean, accessToken: string, zoom: number): void {

        const actionFct = async (dispatch) => {
            if (markers.length > 1) {

                let directionsPromise: Promise<DirectionsImpl>;
                if (autoRouting) {
                    directionsPromise = DirectionsImpl.getDirections(markers, accessToken);
                } else {
                    directionsPromise = DirectionsImpl.getDirectionsWithoutAutoRouting(markers);
                }

                directionsPromise.then(
                    (directions: DirectionsImpl) => dispatch({
                        type: MAP_MAIN_SET_DIRECTIONS,
                        directions: directions,
                        doEvelationCalculation: true,
                        zoom: zoom

                    } as ActionSetDirections),

                    error => dispatch({
                        type: "ERROR"
                    })
                );
            } else {

                const action: ActionSetDirections = {
                    type: MAP_MAIN_SET_DIRECTIONS,
                    directions: null,
                    doEvelationCalculation: true,
                    zoom: zoom
                };
                // Force to be asynchron
                setTimeout(() => { dispatch(action); }, 1); // Works flawlessly

            }
        }
        this.store.dispatch(actionFct);
    }

    delAllMarkers(zoom: number): void {
        const actionFct = async (dispatch) => {
            const action: ActionDeleteAllMarkers = {
                type: MAP_MAIN_DELETE_ALL_MARKERS,
                zoom: zoom
            };

            // Force to be asynchron
            setTimeout(() => { dispatch(action); }, 1); // Works flawlessly
        }
        this.store.dispatch(actionFct);
    }

    setCenter(center: LonLatEle): void {
        const actionFct = async (dispatch) => {
            const action: ActionSetCenter = {
                type: MAP_MAIN_SET_CENTER,
                center: center
            };

            // Force to be asynchron
            setTimeout(() => { dispatch(action); }, 1); // Works flawlessly
        }
        this.store.dispatch(actionFct);
    }

    toggleAutoRoute(state: boolean, zoom: number): void {
        const action: ActionToggleAutoRoute = {
            type: MAP_MAIN_TOGGLE_AUTO_ROUTE,
            state: state,
            zoom: zoom,
        };
        this.store.dispatchAction(action);
    }






}

export { MAP_MAIN_TOGGLE_AUTO_ROUTE, MAP_MAIN_COMPLETE_DIRECTIONS, MAP_MAIN_SET_CENTER, MAP_MAIN_DELETE_ALL_MARKERS, RedMapMain, MAP_MAIN_OPEN_GPX_FILE, MAP_MAIN_SAVE_GPX_FILE, MAP_MAIN_SET_DIRECTIONS, MAP_MAIN_ADD_MARKER, MAP_MAIN_DELETE_MARKER, MAP_MAIN_CHANGE_MARKER };