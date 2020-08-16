import { ReduxComponent } from '../js_web_comp_lib/ReduxComponent';
import { reduxStoreInstance, State } from '../ReduxStore';
import { CSS } from '../Css';
import { AbstractReduxStore } from '../js_web_comp_lib/AbstractReduxStore';
import { AbstractReducer, Action } from '../js_web_comp_lib/AbstractReducer';

class ImpressumReducer extends AbstractReducer<State> {
    constructor() {
        super(reduxStoreInstance);
    }
    reducer(state: State, action: Action): State {

        return state;
    }
}

class ImpressumElement extends ReduxComponent<State> {

    reducer: ImpressumReducer;

    constructor() {
        const reducer = new ImpressumReducer();
        super(reducer, reduxStoreInstance);
        this.reducer = reducer;

    }

    /**
     * Called every time the element is inserted into the DOM. Useful for running setup code,
     * such as fetching resources or rendering. Generally, you should try to delay work until
     * this time.
     */
    connectedCallback(): void {
        super.connectedCallback();


    }

    /**
     * Can be used to register call back operations
     *
     * @memberof Component
     */
    registerCallBack(): void {
        super.registerCallBack();

        const exampleElement = this.shadowRoot.getElementById("ExampleElement");
        //exampleElement.addEventListener(

        //this.dispatchEvent(new CustomEvent<FileDialogResult>('valueSelected', { detail: { files: files } }));


    }

    /**
     * Returns the HTML from which a template shall be created
     */
    getHTML(): string {

        return ReduxComponent.html` 
        ${CSS}

        <style>
        </style>
        
        <h2>Impressum</h2>
        <p>Konrad Schmid<br />
        Hilbertstr. 3<br />
        92421 Schwandorf
        </p>

        <p>
        E-Mail: <a href="mailto:learning.k@skschmid.de">learning.k@skschmid.de</a>
        </p>

        <p>
        <h3>Used content:</h3>


        <a href="http://opentopomap.org">opentopomap.org</a>
        <br/>
        <a href="http://openstreetmap.org">openstreetmap.org</a>
        <br/>
        <a href="http://google.com">google.com</a>
        <br/>
        <a href="http://mapbox.com">mapbox.com</a> 
        <br/>
        <a href="https://geodatenonline.bayern.de/geodatenonline/seiten/wms_fzw">geodatenonline.bayern.de</a>
        <br/>
        <a href="https://hiking.waymarkedtrails.org/help/legal">waymarkedtrails.org</a>
        <br/>
        <a href="https://maps.dwd.de/geoserver/web/">DWD-SAT_WELT_KOMPOSIT</a>
        <br/>
        <a href="https://maps.dwd.de/geoserver/web/">DWD-FX-Produkt</a>
        <br/>
        </p>

        <p>
        <h3>Haftungsausschluss:</h3>
        Da es sich bei dieser Web-Seite um ein reines Lernprojekt von mir handelt, kann keine Haftung übernommen werden.<br/>
        Sinn und Zweck dieser Seite ist, die grundlegenden Techniken von Javascript, Typescript, Html und Css zu erlernen.
        </p>

        
        <p>
        <h3>Source:</h3>
        Der Source-Code ist auf GitHub veröffentlicht und kann eingesehen werden: 
        <a href="https://github.com/uid01089/pathfinder">Pathfinder</a>
        </p>
        `;
    }

    /**
     * This operation is called by Redux
     * @param reduxStore 
     */
    triggeredFromRedux(reduxStore: AbstractReduxStore<State>): void {

        super.triggeredFromRedux(reduxStore);

        // Do needful things as reaction of state change
        // meaning update UI :-)
        switch (reduxStore.getState().action) {
            default:
        }
    }




}
window.customElements.define('impressum-element', ImpressumElement);

export { ImpressumElement };

