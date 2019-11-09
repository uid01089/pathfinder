

import { AbstractReduxStore } from './js_web_comp_lib/AbstractReduxStore';
import { DirectionsImpl } from './GIS/Directions';
import { LonLatEle } from './GIS/GISUtil';
import { IMarker } from './GIS/Marker';


interface State {
    action: string,
    programSetting: ProgramSetting,
    markers: IMarker[],
    directions: DirectionsImpl,
    center: LonLatEle
}

interface ProgramSetting {
    accessToken: string,
    autoRouting: boolean,
    showHikingWays: boolean,
    showCycleWays: boolean
}


const initiateState: State = {
    action: null,
    markers: [],
    center: { longitude: 0, latitude: 0, elevation: 0 },
    directions: null,
    programSetting: {
        autoRouting: false,
        showHikingWays: false,
        showCycleWays: false,
        accessToken: 'pk.eyJ1IjoidWlkMDEwODkiLCJhIjoiY2p6M295MGs2MDVkMDNwb2N5MHljNGFnZiJ9.QLijbhXZfDLxNfIEsBk9Xw'
    }

}

class ReduxStore extends AbstractReduxStore<State> {

    static instance: ReduxStore;


    constructor() {

        super();

        if (!ReduxStore.instance) {
            this.initReduxStore(initiateState);
            ReduxStore.instance = this;
        }

        return ReduxStore.instance;
    }



}

const reduxStoreInstance = new ReduxStore();

export { reduxStoreInstance, ReduxStore, State };


