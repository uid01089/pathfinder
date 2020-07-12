import { LonLatEle } from '../GISUtil';

class HgtFile {

    private rawData: Uint16Array;
    private resolution: number;
    private size: number;
    private refPoint: LonLatEle;

    constructor(rawData: ArrayBuffer, refPoint: LonLatEle) {
        this.rawData = new Uint16Array(rawData);
        this.refPoint = refPoint;

        if (this.rawData.byteLength === 1442401 * 2) {
            this.resolution = 3;
            this.size = 1201;
        } else if (this.rawData.byteLength === 12967201 * 2) {
            this.resolution = 1;
            this.size = 3601;
        } else {
            throw new Error("Neither 1 arcsecond nor 3 arcsecond");
        }
    }

    async getElevation(coordinate: LonLatEle): Promise<number> {

        const size = this.size - 1;

        const row = (coordinate.latitude - this.refPoint.latitude) * size;
        const col = (coordinate.longitude - this.refPoint.longitude) * size;

        if (row < 0 || col < 0 || row > size || col > size) {
            throw new Error('Latitude/longitude is outside tile bounds (row=' +
                row + ', col=' + col + '; size=' + size);
        }


        return this.bilinear(row, col);


    }

    private getValue(row: number, col: number): number {

        const offset = ((this.size - row - 1) * this.size + col);
        const value = this.rawData[offset];

        const highByte = (0xFF00 & value) >> 8;
        const lowByte = 0x00FF & value;

        const twistedValue = (lowByte << 8) | highByte;



        return twistedValue;
    }

    private getMeanValue(v1: number, v2: number, f: number): number {
        return v1 + (v2 - v1) * f;
    }

    private bilinear(row: number, col: number): number {

        const rowLow = Math.floor(row);
        const rowHi = rowLow + 1;
        const rowFrac = row - rowLow;
        const colLow = Math.floor(col);
        const colHi = colLow + 1;
        const colFrac = col - colLow;
        const v00 = this.getValue(rowLow, colLow);
        const v10 = this.getValue(rowLow, colHi);
        const v11 = this.getValue(rowHi, colHi);
        const v01 = this.getValue(rowHi, colLow);
        const v1 = this.getMeanValue(v00, v10, colFrac);
        const v2 = this.getMeanValue(v01, v11, colFrac);

        // console.log('row = ' + row);
        // console.log('col = ' + col);
        // console.log('rowLow = ' + rowLow);
        // console.log('rowHi = ' + rowHi);
        // console.log('rowFrac = ' + rowFrac);
        // console.log('colLow = ' + colLow);
        // console.log('colHi = ' + colHi);
        // console.log('colFrac = ' + colFrac);
        // console.log('v00 = ' + v00);
        // console.log('v10 = ' + v10);
        // console.log('v11 = ' + v11);
        // console.log('v01 = ' + v01);
        // console.log('v1 = ' + v1);
        // console.log('v2 = ' + v2);

        return this.getMeanValue(v1, v2, rowFrac);
    }




}

export { HgtFile };