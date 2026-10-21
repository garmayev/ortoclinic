export interface rawClient {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    photo_url: string;
}

export default class Client {
    private _id: number|undefined;
    private _first_name: string|undefined;
    private _last_name: string|undefined;
    private _phone: string|undefined;
    private _avatar: string|undefined;

    get id(): number | undefined {
        return this._id;
    }

    set id(value: number | undefined) {
        this._id = value;
    }

    get first_name(): string | undefined {
        return this._first_name;
    }

    set first_name(value: string | undefined) {
        this._first_name = value;
    }

    get last_name(): string | undefined {
        return this._last_name;
    }

    set last_name(value: string | undefined) {
        this._last_name = value;
    }

    get phone(): string | undefined {
        return this._phone;
    }

    set phone(value: string | undefined) {
        this._phone = value;
    }

    get avatar(): string | undefined {
        return this._avatar;
    }

    set avatar(value: string | undefined) {
        this._avatar = value;
    }

    get name(): string {
        return this.first_name + ' ' + this.last_name;
    }

    constructor(data: rawClient) {
        this.id = data.id;
        this.first_name = data.first_name;
        this.last_name = data.last_name;
        this.phone = data.phone;
        this.avatar = data.avatar;
    }
}