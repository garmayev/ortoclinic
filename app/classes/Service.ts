import type {ScheduleItem} from "~/classes/Category";

export interface rawService {
    id: number;
    title: string;
    image?: string;
    summary: string;
    description?: string;
    price?: string;
    schedules?: [];
    status?: number;
    category_id?: number;
}

export default class Service {
    private _id?: number;
    private _title: string = "";
    private _image?:string;
    private _summary: string = "";
    private _description?: string;
    private _schedules?: [];
    private _price?: string = "";
    private _status: number = 0;
    private _category_id: number | undefined;

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

    get image(): string|undefined {
        return this._image;
    }

    set image(value: string) {
        this._image = value;
    }

    get summary(): string {
        return this._summary;
    }

    set summary(value: string) {
        this._summary = value;
    }

    get description(): string|undefined {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }
    
    get schedules():[]|undefined
    {
        return this._schedules;
    }
    
    set schedules(value: []) {
        this._schedules = value;
    }
    
    get price(): string|undefined {
        return this._price;
    }
    
    set price(value: string) {
        this._price = value;
    }
    
    get status() 
    {
        return this._status;
    }
    
    set status(value: number)
    {
        this._status = value;
    }
    
    get category_id(): number|undefined
    {
        return this._category_id;
    }
    
    set category_id(value: number)
    {
        this._category_id = value;
    }

    constructor(data: rawService) {
        this.id = data.id;
        this.title = data.title;
        this.image = data.image ?? "";
        this.summary = data.summary;
        this.description = data.description ?? "";
        if (data.price != null) {
            this.price = data.price;
        }
        this.schedules = data.schedules ?? [];
        if (data.status != null) {
            this.status = data.status;
        }
        if (data.category_id != null) {
            this.category_id = data.category_id;
        }
    }

    getSchedule(date: Date) {
        let day = date.getDay();
        if (day === 0) day = 7;
        return this.schedules?.[day];   // безопасный доступ
    }
}