import { Layer } from 'leaflet';

type LayerTypes = Layer | string;

type AddLayerOperation<T extends LayerTypes> = (layer: T) => void;
type RemoveLayerOperation<T extends LayerTypes> = (layer: T) => void;
type UpdateFinishedOperation = () => void;
interface LayerStackParameters<T extends LayerTypes> {
    addLayerOperation: AddLayerOperation<T>;
    removeLayerOperation: RemoveLayerOperation<T>;
    updateFinishedOperation: UpdateFinishedOperation;
}

class LayerStack<T extends LayerTypes>{


    private layerStackParameters: LayerStackParameters<T>;
    private layers: Map<T, boolean> = new Map();

    constructor(layerStackParameters: LayerStackParameters<T>) {
        this.layerStackParameters = layerStackParameters;

    }

    public addLayer(layer: T): void {
        this.layers.set(layer, false);
    }

    public showLayer(layer: T, state: boolean): void {
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

            if (null !== this.layerStackParameters.removeLayerOperation) { this.layerStackParameters.removeLayerOperation(layer); }
            if (state) {
                if (null !== this.layerStackParameters.addLayerOperation) { this.layerStackParameters.addLayerOperation(layer); }
            }
        });

        if (null !== this.layerStackParameters.updateFinishedOperation) { this.layerStackParameters.updateFinishedOperation(); }



    }

    public getValidLayers(): T[] {
        const validLayers: T[] = []

        this.layers.forEach((state, layer) => {
            if (state) {
                validLayers.push(layer);
            }
        });

        return validLayers;
    }


}

export { LayerStack, AddLayerOperation, RemoveLayerOperation, LayerStackParameters, UpdateFinishedOperation };