import { Component } from '../js_web_comp_lib/Component';
import { CSS } from '../Css';
import { reduxStoreInstance, State } from '../ReduxStore';
import { LineChart, DataElement, LineChartSerie, ChartDataLine } from '../js_lib/components/charts/LineChart';
import { MAP_MAIN_COMPLETE_DIRECTIONS, MAP_MAIN_DELETE_ALL_MARKERS } from '../reducers/RedMapMain';
import { DirectionsImpl } from '../GIS/Directions';
import { Util } from '../js_lib/Util';
import { MidiWindowEventResult } from '../js_lib/components/MidiWindow';
import { AbstractReducer, Action } from '../js_web_comp_lib/AbstractReducer';
import { AbstractReduxStore } from '../js_web_comp_lib/AbstractReduxStore';


class RedTrailProfil extends AbstractReducer<State> {
    constructor() {
        super(reduxStoreInstance);
    }
    reducer(state: State, action: Action): State {

        return state;
    }
}





class TrailProfil extends LineChart {


    reducer: RedTrailProfil;


    constructor() {
        const reducer = new RedTrailProfil();
        super(reducer, reduxStoreInstance);
        this.reducer = reducer;


        // Make that values on x-achse are shown with 2 digits
        this.setLabelInterpolationFct((value: number) => { return Util.round(value, 100) });

    }

    connectedCallback(): void {
        super.connectedCallback();
        console.log('Trail Profil');

        this.parentElement.addEventListener('midiWindowChanged', (e: CustomEvent) => {
            // Update in case the MIDI-Window was changed
            const details: MidiWindowEventResult = e.detail;
            this.update();
        });


    }

    getHTML(): string {
        let html = super.getHTML();

        html = html.concat(Component.html` 
        ${CSS}

        <style>
        </style>
        <div></div>

        `);

        return html;
    }

    /**
     * This operation is called by Redux
     * @param reduxStore 
     */
    triggeredFromRedux(reduxStore: AbstractReduxStore<State>): void {

        super.triggeredFromRedux(reduxStore);

        const chartData: ChartDataLine = {
            series: [{
                name: "Distance",
                data: [] as DataElement[]
            }] as LineChartSerie[]
        };

        switch (reduxStore.getState().action) {

            case MAP_MAIN_COMPLETE_DIRECTIONS:
                {
                    console.log("+ complete direction");

                    const direction: DirectionsImpl = reduxStore.getState().directions;

                    let distance = 0;
                    direction.getCoordinates().forEach((coordinate) => {

                        distance = distance + coordinate[3] / 1000;

                        const dataElement: DataElement = {
                            x: distance,
                            y: coordinate[2]
                        }
                        chartData.series[0].data.push(dataElement);
                    });

                    chartData.series[0].name = "Distance: " + Util.round(distance, 100);

                    this.setChartData(chartData);
                    this.update();
                }

                break;

            case MAP_MAIN_DELETE_ALL_MARKERS:
                this.setChartData(chartData);
                this.update();


                break;
            default:
                break;
        }
    }




}
window.customElements.define('trail-profil', TrailProfil);

export { TrailProfil };

