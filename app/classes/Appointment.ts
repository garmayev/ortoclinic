import {Helper} from "~/constant/Helper";
import Client, {type rawClient} from "~/classes/Client";
import Service, {type rawService} from "~/classes/Service";
import axios from "axios";
import Category, {type rawCategory} from "~/classes/Category";

interface rawAppointment {
    id: number;
    date: string|Date;
    client: rawClient;
    services: rawService[];
    categories: rawCategory[];
    timestamp: number
}

export default class Appointment {
    private _id: number|undefined;
    private _date?: Date|undefined;
    private _client: Client|undefined;
    private _services?: Service[] = [];
    private _categories?: Category[] = [];

    get id(): number | undefined {
        return this._id;
    }

    set id(value: number | undefined) {
        this._id = value;
    }

    get date(): Date | undefined {
        return this._date;
    }

    set date(value: Date | undefined) {
        this._date = value;
    }

    get client(): Client | undefined {
        return this._client;
    }

    set client(value: Client | undefined) {
        this._client = value;
    }

    get services(): Service[] {
        return this._services ?? [];
    }

    set services(value: Service[]) {
        this._services = value;
    }

    get categories(): Category[]|undefined {
        return this._categories;
    }

    set categories(value: Category[]) {
        this._categories = value;
    }

    constructor(data: rawAppointment) {
        this.id = data.id;
        if (data.timestamp) {
            this.date = new Date((Number(data.timestamp) - ( 8 * 60 * 60 )) * 1000);
        } else {
            this.date = new Date(data.date);
        }
        this.client = new Client(data.client);
        this.services = data.services.map(service => new Service(service));
        this.categories = data.categories?.map(category => new Category(category))
    }

    static async last():Promise<Appointment|undefined> {
        const user_id = localStorage.getItem('user_id');
        const company_id = import.meta.env.VITE_COMPANY_ID;
        const token = localStorage.getItem('token');
        const result = await axios.get(Helper.apiUrl + `/appointment/last?filter[client_id]=${user_id}&filter[status]=[0,1,2,4]&filter[company_id]=${company_id}`, {
            timeout: 20000,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        });
        if (result.data) {
            return new Appointment(result.data);
        }
    }

    static async cancel(id: number) {
        const token = localStorage.getItem('token');
        const company_id = import.meta.env.VITE_COMPANY_ID;
        return await axios.get(Helper.apiUrl + `/appointment/cancel?id=${id}&company_id=${company_id}`, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            }
        });
    }

    static async getAll() {
        const user_id = localStorage.getItem('user_id');
        const response = await axios.get(Helper.apiUrl + `/appointment/index?filter[client_id]=${user_id}&sort=-date`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + localStorage.getItem('token'),
            },
        });
        return response.data.map((appointment: any) => new Appointment(appointment));
    }

    static async create({date, start, end, status, source, client_id, company_id, branch_id, services, categories}: {
        date: string,
        start: string,
        end?: string,
        status: number,
        source: string,
        client_id: number,
        company_id: number,
        branch_id: number,
        services?: number[]
        categories?: number[],
    }) {
        const formData = new FormData();
        formData.append('Appointment[date]', date);
        formData.append('Appointment[start]', start);
        formData.append('Appointment[end]', end ?? "");
        formData.append('Appointment[status]', status.toString());
        formData.append('Appointment[source]', source);
        formData.append('Appointment[client_id]', client_id.toString());
        formData.append('Appointment[company_id]', company_id.toString());
        formData.append('Appointment[branch_id]', branch_id.toString());
        formData.append('Appointment[master_id]', "3048");
        services?.map((service, index) => formData.append(`Appointment[services][${index}]`, service.toString()));
        categories?.map((category, index) => formData.append(`Appointment[categories][${index}]`, category.toString()));
        const token = localStorage.getItem('token');
        return fetch(Helper.apiUrl + `/appointment/create`, {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then(response => response.json())
    }
}
