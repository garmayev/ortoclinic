interface rawPromo {
    id: number;
    title: string;
    summary: string;
    image?: string;
    description?: string;
    company_id: number;
    created_at: number;
    updated_at: number;
}

class Promo {
    private _id:number = 0;
    private _title: string = "";
    private _summary: string = "";
    private _image?: string;
    private _description?: string;
    private _company_id: number = 0;
    private _created_at: Date = new Date();
    private _updated_at: Date = new Date();

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    get summary(): string {
        return this._summary;
    }

    set summary(value: string) {
        this._summary = value;
    }

    get image(): string {
        return this._image ?? "";
    }

    set image(value: string) {
        this._image = value;
    }

    get description(): string {
        return this._description ?? "";
    }

    set description(value: string) {
        this._description = value;
    }

    get company_id(): number {
        return this._company_id;
    }

    set company_id(value: number) {
        this._company_id = value;
    }

    get created_at(): Date {
        return this._created_at;
    }

    set created_at(value: Date) {
        this._created_at = value;
    }

    get updated_at(): Date {
        return this._updated_at;
    }

    set updated_at(value: Date) {
        this._updated_at = value;
    }

    constructor(data: rawPromo) {
        this.id = data.id;
        this.title = data.title;
        this.summary = data.summary;
        this.description = data.description ?? "";
        this.image = data.image ?? "";
        this.company_id = data.company_id;
        this.created_at = new Date(data.created_at * 1000);
        this.updated_at = new Date(data.updated_at * 1000);
    }
}