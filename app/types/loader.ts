// types/loader.ts
import type Category from "~/classes/Category";
import type Appointment from "~/classes/Appointment";
import type Company from "~/classes/Company";

export interface CreateRouteLoaderData {
    category: Awaited<ReturnType<typeof Category.getChildrenById>> | null;
    company: Company
}

export interface HomeRouteLoaderData {
    appointment: Appointment|undefined;
    company: Company|undefined;
}