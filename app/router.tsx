// app/router.tsx
import { createBrowserRouter } from "react-router";
import Root from "./root";
import Layout from "./components/Layout";
import Welcome from "./pages/welcome/index";
import Home from "./pages/home/route";
import History from "./pages/history/route";
import About from "./pages/home/about";
import Promo from "./pages/home/promo/route";
import PromoView from "./pages/home/promo/view";
import Services from "./pages/home/services/route";
import ServicesView from "./pages/home/services/view";
import Create from "~/pages/create/route.tsx";

// Определяем базовый путь
const getBasename = () => {
    console.log(import.meta.env.PROD ? '/max/app-1/' : '/')
    // В production используем ТОТ ЖЕ путь, что и в Vite baseUrl
    return import.meta.env.PROD ? '/max/app-1/' : '/';
};

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        children: [
            {
                element: <Layout />,
                children: [
                    {
                        index: true,
                        element: <Welcome />
                    },
                    {
                        path: "home",
                        children: [
                            {
                                index: true,
                                element: <Home />
                            },
                            {
                                path: "about",
                                element: <About />
                            },
                            {
                                path: "promo",
                                children: [
                                    {
                                        index: true,
                                        element: <Promo />
                                    },
                                    {
                                        path: ":id",
                                        element: <PromoView />
                                    }
                                ]
                            },
                            {
                                path: "services",
                                children: [
                                    {
                                        index: true,
                                        element: <Services />
                                    },
                                    {
                                        path: ":id",
                                        element: <ServicesView />
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        path: "history",
                        element: <History />
                    },
                    {
                        path: "create",
                        element: <Create />
                    }
                ]
            }
        ]
    }
], {
    basename: getBasename(),
});