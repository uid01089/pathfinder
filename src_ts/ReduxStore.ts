

import { AbstractReduxStore } from './lib/AbstractReduxStore';
import { DirectionsImpl } from './lib/MapBox/Directions';
import { IMarker, LonLatEle } from './lib/MapBox/MapBoxUtil';


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
    center: [0, 0, 0],
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


