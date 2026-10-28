import axios from "axios";
import {Helper} from "~/constant/Helper";

class Account {
    private _id?: number;
    private _username?: string;
    private _email?: string;
    private _status?: string;
    private _access_token?: string;

    get id(): number|undefined {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get username(): string|undefined {
        return this._username;
    }

    set username(value: string) {
        this._username = value;
    }

    get email(): string|undefined {
        return this._email;
    }

    set email(value: string) {
        this._email = value;
    }

    get status(): string|undefined {
        return this._status;
    }

    set status(value: string) {
        this._status = value;
    }

    get access_token(): string|undefined {
        return this._access_token;
    }

    set access_token(value: string) {
        this._access_token = value;
    }

    constructor(data: any) {
        this._id = data.id
        this._username = data.username
        this._email = data.email
        this._status = data.status
        this._access_token = data.access_token
    }

    static async checkChatId(chatId: number) {
        try {
            const company_id = import.meta.env.VITE_COMPANY_ID;
            const response = await axios.get(`${Helper.apiUrl}/user/check-chat-id?chat_id=${chatId}&company_id=${company_id}`, {timeout: 20000})
            if (response.data) {
                return new Account(response.data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    static async register(user: any) {
        const company_id = import.meta.env.VITE_COMPANY_ID;
        try {
            const response = await axios.post(`${Helper.apiUrl}/user/register-telegram?source=max&company_id=${company_id}`, user)
            if (response.data) {
                return new Account(response.data)
            }
        } catch (error) {
            console.log(error)
        }
    }
}

export default Account
