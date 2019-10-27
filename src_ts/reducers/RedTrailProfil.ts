import { AbstractReducer } from '../js_web_comp_lib/AbstractReducer.js';
import { Action } from 'redux';
import { State, reduxStoreInstance } from '../ReduxStore';


class RedTrailProfil extends AbstractReducer<State> {
    constructor() {
        super(reduxStoreInstance);
    }
    reducer(state: State, action: Action): State {

        return state;
    }
}

export { RedTrailProfil };