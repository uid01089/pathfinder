import { Map as LMap, Layer } from 'leaflet';

class LayerStack {
    private map: LMap;
    private layers: Map<Layer, boolean> = new Map();

    constructor(map: LMap) {
        this.map = map;
    }

    public addLayer(layer: Layer): void {
        this.layers.set(layer, false);
    }

    public showLayer(layer: Layer, state: boolean): void {
        const particularLayer = this.layers.get(layer);
        if (undefined === particularLayer) {
            throw new Error("Layer not exists");
        } else {
            this.layers.set(layer, state);
        }

        this.updateView();

    }

    private updateView(): void {
        this.layers.forEach((state, layer) => {
            this.map.removeLayer(layer);
            if (state) {
                this.map.addLayer(layer);
            }
        })

    }
}

export { LayerStack };