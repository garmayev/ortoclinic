import {Helper} from "~/constant/Helper";
import axios from "axios";
import {createRequestCoalescer} from '../requestCoalescer.mjs';
import {isBookingOptimizationEnabled} from '../bookingOptimization';

const shareCompanyRequest = createRequestCoalescer();
let bookingMetadata: {scope: string; company: Company} | undefined;
const metadataScope = (id: any) => `${localStorage.getItem('token')}:${localStorage.getItem('user_id')}:${import.meta.env.VITE_COMPANY_ID}:${id}`;

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
        const token = localStorage.getItem('token');
        const scope = metadataScope(company_id);
        return shareCompanyRequest(`${token}:${import.meta.env.VITE_COMPANY_ID}`, String(company_id), async () => {
            try {
                const response = await axios.get(`${Helper.apiUrl}/company/view?id=${company_id}`, {
                    timeout: 20000,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const company = new Company(response.data);
                if (isBookingOptimizationEnabled() && Number(company.id) === Number(company_id) && scope === metadataScope(company_id)) {
                    bookingMetadata = {scope, company};
                }
                return company;
            } catch (e) {
                throw e;
            }
        });
    }

    // Metadata only, in memory; no service prices or availability are retained.
    static async getForBooking(company_id: any) {
        if (isBookingOptimizationEnabled() && bookingMetadata?.scope === metadataScope(company_id)) {
            return bookingMetadata.company;
        }
        return Company.get(company_id);
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
