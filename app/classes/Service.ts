
export interface rawService {
    id: number;
    title: string;
}

export default class Service {
    private _id?: number;
    private _title?: string;

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

    constructor(data: rawService) {
        this.id = data.id;
        this.title = data.title;
    }
}