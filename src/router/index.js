import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import Register from "../views/Register.vue";
import SiteUnavailable from "../views/SiteUnavailable.vue";
import SuperAdminDashboard from "../views/SuperAdminDashboard.vue"

import SiteBuilder from "../views/SiteBuilder.vue";

import DefaultChurchView from "../views/DefaultChurchView.vue";
import ModernTemplate from "../views/templates/ModernTemplate.vue";
import ClassicTemplate from "../views/templates/ClassicTemplate.vue";

import api from "../services/api";

const routes = [
    { path: "/", component: Home },
    { path: "/login", component: Login },
    { path: "/register", component: Register },
    { path: "/church/:churchId/dashboard", component: Dashboard },
    { path: "/church/:churchId/site-builder", component: SiteBuilder },
    { path: "/superadmin-dashboard", component: SuperAdminDashboard },

    { path: "/:subdomain", component: DefaultChurchView, props: true },
    { path: "/site-unavailable", component: SiteUnavailable },

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Middleware to check if the subdomain's church is published
const detectSubdomain = () => {
    const hostname = window.location.hostname; // Example: "church1.localhost"
    if (hostname !== "localhost" && hostname.endsWith(".localhost")) {
        return hostname.split(".")[0]; // Extracts "church1"
    }
    return null;
};

let lastSubdomain = detectSubdomain(); // Store the initial subdomain

// 🔥 Middleware to handle subdomain-based routing
router.beforeEach(async (to, from, next) => {
    const subdomain = detectSubdomain();
    const hostname = window.location.hostname;

    // If we are on a subdomain, check the church status
    if (subdomain) {
        try {
            const response = await api.get(`/churches/subdomain/${hostname}`);
            const church = response.data;

            if (!church.isPublished) {
                console.warn("🚨 Church is unpublished. Redirecting to Site Unavailable.");
                return next("/site-unavailable"); // Redirect properly
            }

            // ✅ Select the correct template
            let templateComponent = DefaultChurchView;
            if (church.templateId && church.templateId.name) {
                switch (church.templateId.name.toLowerCase()) {
                    case "modern":
                        templateComponent = ModernTemplate;
                        break;
                    case "classic":
                        templateComponent = ClassicTemplate;
                        break;
                }
            }

            if (router.hasRoute("church-view")) {
                router.removeRoute("church-view");
            }

            router.addRoute({
                path: "/http://localhost:5173/:subdomain" + church.name,
                component: templateComponent,
                props: { church },
                name: "church-view",
            });

            return next(); // Proceed to the newly registered route
        } catch (error) {
            console.error("❌ Error fetching church:", error);

            console.warn("🚨 Church not found. Redirecting to Site Unavailable.");
            return next("/site-unavailable"); // Properly redirect
        }
    }

    next(); // Allow normal routing for non-subdomain pages
});

export default router;
