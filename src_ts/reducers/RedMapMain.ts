import { AbstractReducer } from '../js_web_comp_lib/AbstractReducer';
import { Action, ActionCreatorsMapObject } from 'redux';
import { State, reduxStoreInstance } from '../ReduxStore';
import { DirectionsImpl } from '../GIS/Directions';
import { GISUtil } from '../GIS/GISUtil';
import { GpxFile, LonLatEle, Track } from '../GIS/GpxFile';
import { Elevation } from '../GIS/Elevation';
import { IMarker } from '../GIS/Marker';



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
    files: FileList
}
interface ActionSaveGpxFile extends Action {

}
interface ActionSetDirections extends Action {
    directions: DirectionsImpl;
    doEvelationCalculation: boolean;
}
interface ActionAddMarkers extends Action {
    marker: IMarker;
}
interface ActionChangeMarkers extends Action {
    marker: IMarker;
    index: number;
}
interface ActionDeleteMarkers extends Action {
    marker: IMarker;
    index: number;
}
interface ActionDeleteAllMarkers extends Action {

}

interface ActionToggleAutoRoute extends Action {

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
                    var actionReadIn: ActionOpenGpxFile = action as ActionOpenGpxFile;

                    var files = actionReadIn.files;

                    Array.from(files).forEach((file) => {


                        var gpxFilePromise = GpxFile.load(file);

                        gpxFilePromise.then((gpxFile) => {
                            var tracks = gpxFile.getTrks();



                            // Add a direction with values from track 0
                            this.setDirectionsByTrack(tracks[0]);

                            // Set Map center to the first marker
                            this.setCenter(tracks[0].lonLatEles[0]);


                        }).catch((error) => {
                            console.warn(error);
                        })
                    })


                    var newState = Object.assign({}, state, {
                        action: actionReadIn.type,
                    });

                    // Delete all markers and tracks
                    newState.markers = [];

                    return newState;
                }

            case MAP_MAIN_SAVE_GPX_FILE:
                {
                    var actionSaveGpxFile: ActionSaveGpxFile = action as ActionSaveGpxFile;
                    var newState0 = Object.assign({}, state, {
                        action: actionSaveGpxFile.type,
                    });

                    return newState0;
                }

            case MAP_MAIN_TOGGLE_AUTO_ROUTE:
                {
                    var actionToogleAutoRoute: ActionToggleAutoRoute = action as ActionToggleAutoRoute;
                    var newStateToogleAutoRoute = Object.assign({}, state, {
                        action: actionToogleAutoRoute.type,
                    });

                    newStateToogleAutoRoute.programSetting.autoRouting = !newStateToogleAutoRoute.programSetting.autoRouting;

                    // Trigger route calculation
                    this.setDirectionsByMarkers(newStateToogleAutoRoute.markers, newStateToogleAutoRoute.programSetting.autoRouting, newStateToogleAutoRoute.programSetting.accessToken);


                    return newStateToogleAutoRoute;
                }

            case MAP_MAIN_SET_DIRECTIONS:
                {
                    var actionSetDirections: ActionSetDirections = action as ActionSetDirections;
                    var newState1 = Object.assign({}, state, {
                        action: actionSetDirections.type,
                        directions: actionSetDirections.directions,
                    });

                    if (typeof newState1.directions !== 'undefined' && newState1.directions != null) {
                        this.completeDirections(newState1.directions, newState1.programSetting.accessToken, actionSetDirections.doEvelationCalculation);
                    }

                    return newState1;
                }

            case MAP_MAIN_COMPLETE_DIRECTIONS:
                {
                    var actionCompleteDirections: ActionCompleteDirection = action as ActionCompleteDirection;
                    var newStateCompleteDirections = Object.assign({}, state, {
                        action: actionCompleteDirections.type,
                        directions: actionCompleteDirections.directions,
                    });



                    return newStateCompleteDirections;
                }

            case MAP_MAIN_ADD_MARKER:
                {
                    var actionAddMarker: ActionAddMarkers = action as ActionAddMarkers;
                    var marker = actionAddMarker.marker;

                    var newState2 = Object.assign({}, state, {
                        action: actionAddMarker.type,
                    });

                    newState2.markers.push(marker);

                    // Trigger route calculation
                    this.setDirectionsByMarkers(newState2.markers, newState2.programSetting.autoRouting, newState2.programSetting.accessToken);

                    return newState2;
                }

            case MAP_MAIN_DELETE_ALL_MARKERS:
                {
                    var actionDeleteAllMarker: ActionDeleteAllMarkers = action as ActionDeleteAllMarkers;

                    var newStateDeleteAllMarker = Object.assign({}, state, {
                        action: actionDeleteAllMarker.type,
                    });

                    newStateDeleteAllMarker.markers = [];

                    // Trigger route calculation
                    this.setDirectionsByMarkers(newStateDeleteAllMarker.markers, newStateDeleteAllMarker.programSetting.autoRouting, newStateDeleteAllMarker.programSetting.accessToken);

                    return newStateDeleteAllMarker;
                }

            case MAP_MAIN_CHANGE_MARKER: {
                var actionChangeMarker: ActionChangeMarkers = action as ActionChangeMarkers;
                var marker = actionChangeMarker.marker;
                var index = actionChangeMarker.index;

                var newState4 = Object.assign({}, state, {
                    action: actionChangeMarker.type,
                });

                newState4.markers[index] = marker;

                // Trigger route calculation
                this.setDirectionsByMarkers(newState4.markers, newState4.programSetting.autoRouting, newState4.programSetting.accessToken);

                return newState4;
            }

            case MAP_MAIN_DELETE_MARKER:
                {
                    var actionDeleteMarker: ActionDeleteMarkers = action as ActionDeleteMarkers;
                    var marker = actionDeleteMarker.marker;
                    var index = actionDeleteMarker.index;

                    var newState3 = Object.assign({}, state, {
                        action: actionDeleteMarker.type,
                    });

                    newState3.markers.splice(index, 1);

                    // Trigger route calculation
                    this.setDirectionsByMarkers(newState3.markers, newState3.programSetting.autoRouting, newState3.programSetting.accessToken);

                    return newState3;
                }

            case MAP_MAIN_SET_CENTER:
                {
                    var actionSetCenter: ActionSetCenter = action as ActionSetCenter;

                    var newStateSetCenter = Object.assign({}, state, {
                        action: actionSetCenter.type,
                        center: actionSetCenter.center
                    });


                    return newStateSetCenter;
                }
            default: return state;
        }

    }


    openGpxFile(files: FileList) {


        const action: ActionOpenGpxFile = {
            type: MAP_MAIN_OPEN_GPX_FILE,
            files: files
        }
        this.store.dispatch(action);


        const options = {
            //title: 'Open a file or folder',
            //defaultPath: '/path/to/something/',
            //buttonLabel: 'Do it',
            filters: [
                { name: 'gpx', extensions: ['gpx'] }
            ],
            properties: ['openFile', 'promptToCreate'],
            //message: 'This message will only be shown on macOS'
        };


        /*
        dialog.showOpenDialog(null, options, (fileNames) => {

            if (typeof fileNames !== 'undefined') {

                if (fileNames.length > 0) {

                    const action: ActionOpenGpxFile = {
                        type: MAP_MAIN_OPEN_GPX_FILE,
                        path: fileNames[0]
                    }
                    this.store.dispatch(action);
                }
            }
        }
        );
        */

    }
    saveGpxFile() {
        const action: ActionSaveGpxFile = {
            type: MAP_MAIN_SAVE_GPX_FILE
        }
        this.store.dispatch(action);
    }


    addMarker(markerToBeAdded: IMarker) {
        const action: ActionAddMarkers = {
            type: MAP_MAIN_ADD_MARKER,
            marker: markerToBeAdded
        }
        this.store.dispatch(action);
    }

    changeMarker(index: number, marker: IMarker) {
        const action: ActionChangeMarkers = {
            type: MAP_MAIN_CHANGE_MARKER,
            marker: marker,
            index: index
        }
        this.store.dispatch(action);
    }

    deleteMarker(index: number, markerToBeDeleted: IMarker) {
        const action: ActionDeleteMarkers = {
            type: MAP_MAIN_DELETE_MARKER,
            marker: markerToBeDeleted,
            index: index
        }
        this.store.dispatch(action);
    }

    setDirectionsByTrack(track: Track) {
        let actionFct = (dispatch) => {
            var directionsPromise = DirectionsImpl.getDirectionsFromTrack(track);
            directionsPromise.then(
                (directions: DirectionsImpl) => dispatch({
                    type: MAP_MAIN_SET_DIRECTIONS,
                    directions: directions,
                    doEvelationCalculation: false


                } as ActionSetDirections),

                error => dispatch({
                    type: "ERROR"
                })
            );
        }
        this.store.dispatch(actionFct);

    }

    completeDirections(directions: DirectionsImpl, accessToken: string, doEvelationCalculation: boolean = true) {
        let actionFct = (dispatch) => {
            var directionsCompletedPromise = directions.complete(accessToken, doEvelationCalculation);

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

    setDirectionsByMarkers(markers: IMarker[], autoRouting: boolean, accessToken: string) {

        let actionFct = (dispatch) => {
            if (markers.length > 1) {

                var directionsPromise: Promise<DirectionsImpl>;
                if (autoRouting) {
                    directionsPromise = DirectionsImpl.getDirections(markers, accessToken);
                } else {
                    directionsPromise = DirectionsImpl.getDirectionsWithoutAutoRouting(markers);
                }

                directionsPromise.then(
                    (directions: DirectionsImpl) => dispatch({
                        type: MAP_MAIN_SET_DIRECTIONS,
                        directions: directions,
                        doEvelationCalculation: true

                    } as ActionSetDirections),

                    error => dispatch({
                        type: "ERROR"
                    })
                );
            } else {

                const action: ActionSetDirections = {
                    type: MAP_MAIN_SET_DIRECTIONS,
                    directions: null,
                    doEvelationCalculation: true
                };
                // Force to be asynchron
                setTimeout(() => { dispatch(action); }, 1); // Works flawlessly

            }
        }
        this.store.dispatch(actionFct);
    }

    delAllMarkers() {
        let actionFct = (dispatch) => {
            const action: ActionDeleteAllMarkers = {
                type: MAP_MAIN_DELETE_ALL_MARKERS
            };

            // Force to be asynchron
            setTimeout(() => { dispatch(action); }, 1); // Works flawlessly
        }
        this.store.dispatch(actionFct);
    }

    setCenter(center: LonLatEle) {
        let actionFct = (dispatch) => {
            const action: ActionSetCenter = {
                type: MAP_MAIN_SET_CENTER,
                center: center
            };

            // Force to be asynchron
            setTimeout(() => { dispatch(action); }, 1); // Works flawlessly
        }
        this.store.dispatch(actionFct);
    }

    toggleAutoRoute() {
        const action: ActionToggleAutoRoute = {
            type: MAP_MAIN_TOGGLE_AUTO_ROUTE
        };
        this.store.dispatch(action);
    }






}

export { MAP_MAIN_TOGGLE_AUTO_ROUTE, MAP_MAIN_COMPLETE_DIRECTIONS, MAP_MAIN_SET_CENTER, MAP_MAIN_DELETE_ALL_MARKERS, RedMapMain, MAP_MAIN_OPEN_GPX_FILE, MAP_MAIN_SAVE_GPX_FILE, MAP_MAIN_SET_DIRECTIONS, MAP_MAIN_ADD_MARKER, MAP_MAIN_DELETE_MARKER, MAP_MAIN_CHANGE_MARKER };