import axios from "axios";
import {Helper} from "~/constant/Helper";
import Company from "~/classes/Company";
import Service from "~/classes/Service";
import {createRequestCoalescer} from '../requestCoalescer.mjs';

const shareDirectionsRequest = createRequestCoalescer();
export const BOOKING_DIRECTION_FIELDS = 'id,title,company_id,status,source,children.id,children.title,children.company_id,children.status,children.source';

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
    private _children: Category[] = [];
    private _resolvedCompany?: Company;
    private _services = [];
    private _servicesLoaded = false;
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

    get children(): Category[] {
        return this._children;
    }

    set children(value: any[]) {
        // @ts-ignore
        this._children = value.map(item => new Category(item, this._resolvedCompany))
    }

    get services(): never[] {
        return this._services;
    }

    get servicesLoaded(): boolean {
        return this._servicesLoaded;
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
    
    constructor(data: any, company?: Company) {
        this._servicesLoaded = Array.isArray(data.services);
        this._resolvedCompany = company;
        this.id = data.id
        if (company && Number(company.id) === Number(data.company_id)) this._company = company;
        else this.company = data.company_id;
        this.source = data.source;
        this.status = data.status;
        this.title = data.title;
        this.services = data.services ?? [];
        this.children = data.children ?? [];
        this.schedules = data.schedules ?? [];
    }

    static async getChildrenById(id: number, company?: Company) {
        const token = localStorage.getItem('token');
        const category = await axios.get(`${Helper.apiUrl}/category/view?id=${id}&filter[status]=1`, {
            timeout: 20000,
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return new Category(category.data, company);
    }

    static async getBookingDirections(id: number, company: Company): Promise<Category> {
        const token = localStorage.getItem('token');
        const scope = `${token}:${localStorage.getItem('user_id')}:${company.id}`;
        return shareDirectionsRequest(scope, String(id), async () => {
            let response;
            try {
                response = await axios.get(`${Helper.apiUrl}/category/view?id=${id}&filter[status]=1&fields=${encodeURIComponent(BOOKING_DIRECTION_FIELDS)}`, {
                    timeout: 20000,
                    headers: {Authorization: `Bearer ${token}`},
                });
            } catch (error: any) {
                if ([400, 422].includes(error.response?.status)) return Category.getChildrenById(id, company);
                throw error;
            }
            if (response.data?.id !== id || response.data?.company_id == null || !Array.isArray(response.data?.children) || response.data.children.some((item: any) => item.id == null || item.company_id == null || typeof item.title !== 'string')) {
                // Older API versions may not support the projection. Preserve the full path.
                return Category.getChildrenById(id, company);
            }
            return new Category(response.data, company);
        });
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
