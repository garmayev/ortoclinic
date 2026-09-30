interface BranchData {
    id: number;
    title: string;
    latitude: number;
    longitude: number;
}

class Branch {
    private _id?: number;
    private _title?: string;
    private _latitude?: number;
    private _longitude?: number;

    get id(): number|undefined {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get title(): string|undefined {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    get latitude(): number|undefined {
        return this._latitude;
    }

    set latitude(value: number) {
        this._latitude = value;
    }

    get longitude(): number|undefined {
        return this._longitude;
    }

    set longitude(value: number) {
        this._longitude = value;
    }

    constructor(data: BranchData) {
        this._id = data.id;
        this._title = data.title;
        this._latitude = data.latitude;
        this._longitude = data.longitude;
    }
}