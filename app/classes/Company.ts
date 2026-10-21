import {Helper} from "~/constant/Helper";
import axios from "axios";
import {data} from "react-router";

interface CompanyData {
    id: number;
    title: string;
    logo: string;
    default_category_id: number;
    branches: string[];
}

export default class Company {
    private _id?: number;
    private _title?: string;
    private _logo?: string;
    private _default_category_id?: number;
    private _branches: Branch[] = [];
    private _type: string = ""

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

    get logo(): string|undefined {
        return this._logo;
    }

    set logo(value: string) {
        this._logo = value;
    }

    get default_category_id(): number | undefined {
        return this._default_category_id;
    }

    set default_category_id(value: number) {
        this._default_category_id = value;
    }

    get branches(): Branch[] {
        return this._branches;
    }

    set branches(value: Branch[]) {
        this._branches = value;
    }

    get type(): string {
        return this._type;
    }

    set type(value: string) {
        this._type = value;
    }

    constructor(data: CompanyData|undefined) {
        if (data) {
            this.id = data.id;
            this.title = data.title;
            this.default_category_id = data.default_category_id;
            this.logo = data.logo;
            this.type = "ул. Каландаришвили, 31";
        }
    }

    static async get(company_id: any) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${Helper.apiUrl}/company/view?id=${company_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return new Company(response.data);
        } catch (e) {
            return new Company({
                id: 0,
                title: 'Unknown',
                logo: '',
                default_category_id: 0,
            } as CompanyData);
        }
    }

    static async getBranches(company_id: any) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${Helper.apiUrl}/company/branches?id=${company_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (e) {
            return {
                id: 0,
                name: 'Unknown'
            };
        }
    }
}