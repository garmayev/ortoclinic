// app/root.tsx
import { useEffect } from "react";
import { AppProvider } from "~/hooks/AppContext";
import { MessengerProvider } from "~/hooks/MessengerContext";
import "~/app.css";
import {Outlet} from "react-router";

export default function Root() {
    useEffect(() => {
        console.log('[Root] Component mounted');
    }, []);
    
    console.log('[Root] Rendering');
    
    return (
        <AppProvider>
            <MessengerProvider>
                <Outlet />
            </MessengerProvider>
        </AppProvider>
    );
}
