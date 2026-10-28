import axios from "axios";
import {Helper} from "~/constant/Helper";
import Company from "~/classes/Company";
import Service from "~/classes/Service";

export interface ScheduleItem {
    id: number,
    target_id: number,
    target_class: string,
    day_of_week: number,
    is_working: number,
    start_time: string,
    end_time: string,
    break_start: string|null,
    break_end: string|null,
    created_at: number,
    updated_at: number,
    available_time_slots: [],
}

export interface rawCategory {
    id: number;
    company_id: number;
    source: string;
    status: number;
    title: string;
    services: [];
    children: [];
    parent: Category;
}

class Category {
    private _id: number = 0;
    private _company: Company | undefined;
    private _parent: Category | undefined;
    private _status: number = 0;
    private _source: string = "";
    private _title = "";
    private _children = [];
    private _services = [];
    private _schedules = [];

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get company(): Company|undefined {
        return this._company;
    }

    set company(value:number) {
        Company.get(value)
            .then(company => this._company = company)
            .catch(() => { this._company = undefined; })
    }

    get parent(): Category | undefined {
        return this._parent;
    }

    set parent(value: Category | undefined) {
        this._parent = value;
    }

    get status() {
        return this._status;
    }

    set status(value) {
        this._status = value;
    }

    get source() {
        return this._source;
    }

    set source(value) {
        this._source = value;
    }

    get title() {
        return this._title;
    }

    set title(value) {
        this._title = value;
    }

    get children(): never[] {
        return this._children;
    }

    set children(value: any[]) {
        // @ts-ignore
        this._children = value.map(item => new Category(item))
    }

    get services(): never[] {
        return this._services;
    }

    set services(value: []) {
        // @ts-ignore
        this._services = value.map(item => new Service(item));
    }
    
    get schedules() {
        return this._schedules;
    }
    
    set schedules(value) {
        this._schedules = value;
    }
    
    constructor(data: any) {
        this.id = data.id
        this.company = data.company_id;
        this.source = data.source;
        this.status = data.status;
        this.title = data.title;
        this.services = data.services;
        this.children = data.children;
        this.schedules = data.schedules;
    }

    static async getChildrenById(id: number) {
        const token = localStorage.getItem('token');
        const category = await axios.get(`${Helper.apiUrl}/category/view?id=${id}&filter[status]=1`, {
            timeout: 20000,
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return new Category(category.data);
    }

    static async getTimeList(id: number, date: number) {
        const token = localStorage.getItem('token')
        const timeSlots = await axios.get(`${Helper.apiUrl}/category/time-slots?id=${id}&date=${date}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return timeSlots.data;
    };

    getSchedule(date: any): ScheduleItem {
        let day = date.getDay();
        if (day === 0) day = 7;
        return this.schedules[day];
    }
}

export default Category
