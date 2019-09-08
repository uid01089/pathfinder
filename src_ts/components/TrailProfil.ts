//import { LitElement, html } from '@polymer/lit-element';
import { Component } from '../lib/Component';
import { CSS } from '../Css';
import { RedTrailProfil } from '../reducers/RedTrailProfil';
import { reduxStoreInstance } from '../ReduxStore';
import { LineChart, DataElement, LineChartSerie, ChartDataLine } from '../lib/components/LineChart';
import { MAP_MAIN_COMPLETE_DIRECTIONS, MAP_MAIN_DELETE_ALL_MARKERS } from '../reducers/RedMapMain';
import { DirectionsImpl } from '../lib/MapBox/Directions';
import { Util } from '../lib/Util';






class TrailProfil extends LineChart {


    _reducer: RedTrailProfil;
    reduxListenerUnsubsribe: Function;

    constructor() {
        super();

        this._reducer = new RedTrailProfil();
        reduxStoreInstance.registerReducer(this._reducer);
        this.reduxListenerUnsubsribe = reduxStoreInstance.subscribe(() => this.reduxtrigger(reduxStoreInstance));

        // Make that values on x-achse are shown with 2 digits
        this.setLabelInterpolationFct((value: number) => { return Util.round(value, 100) });

    }

    connectedCallback() {
        super.connectedCallback();
        console.log('Trail Profil');

    }

    getHTML() {
        var html = super.getHTML();

        html = html.concat(Component.html` 
        ${CSS}

        <style>
        </style>
        <div></div>

        `);

        return html;
    }

    reduxtrigger(reduxStoreInstance) {
        if (!this.isConnected) {
            this.reduxListenerUnsubsribe();
        }

        var chartData: ChartDataLine = {
            series: [{
                name: "Distance",
                data: [] as DataElement[]
            }] as LineChartSerie[]
        };

        switch (reduxStoreInstance.getState().action) {

            case MAP_MAIN_COMPLETE_DIRECTIONS:
                console.log("+ complete direction");
                var direction: DirectionsImpl = reduxStoreInstance.getState().directions;



                var distance: number = 0;
                direction.getCoordinates().forEach((coordinate) => {

                    distance = distance + coordinate[3] / 1000;

                    var dataElement: DataElement = {
                        x: distance,
                        y: coordinate[2]
                    }
                    chartData.series[0].data.push(dataElement);
                });

                chartData.series[0].name = "Distance: " + Util.round(distance, 100);

                this.setChartData(chartData);
                this.update();

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

