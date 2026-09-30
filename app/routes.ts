// routes.ts
import { type RouteConfig, index, route, prefix, layout } from "@react-router/dev/routes";

export default [
    layout("./components/Layout.tsx", [
        index("pages/welcome/index.tsx"),  // 👈 для /max/app-1/
        ...prefix(`home`, [
            index("pages/home/route.tsx"),
        ]),
        route('create', 'pages/create/route.tsx')
    ]),
] satisfies RouteConfig;