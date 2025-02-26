import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import Register from "../views/Register.vue";

import SuperAdminDashboard from "../views/SuperAdminDashboard.vue"

const routes = [
    { path: "/", component: Home },
    { path: "/login", component: Login },
    { path: "/register", component: Register },
    { path: "/church/:churchId/dashboard", component: Dashboard },
    { path: "/superadmin-dashboard", component: SuperAdminDashboard },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
