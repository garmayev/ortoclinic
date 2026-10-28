// This repository deploys app-1. Keep the existing path for any other clinic build.
export const isBookingOptimizationEnabled = () =>
    String(import.meta.env.VITE_COMPANY_ID) === '1' || import.meta.env.MODE === 'stand';
