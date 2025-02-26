<template>
    <div class="container">
        <h1 class="title">SuperAdmin Dashboard</h1>
        <button @click="logout" class="logout-button">Logout</button>

        <!-- CREATE CHURCH SECTION -->
        <div class="section">
            <h2 class="subtitle">Create Church & Assign Admin</h2>
            <form @submit.prevent="createChurch" class="form">
                <input v-model="churchName" type="text" placeholder="Church Name" class="input-field" required />
                <input v-model="adminName" type="text" placeholder="Admin Name" class="input-field" required />
                <input v-model="adminEmail" type="email" placeholder="Admin Email" class="input-field" required />
                <input v-model="adminPassword" type="password" placeholder="Admin Password" class="input-field" required />
                <button type="submit" class="submit-button">Create Church</button>
            </form>
        </div>

        <!-- LIST & MANAGE CHURCHES -->
        <div class="section">
            <h2 class="subtitle">All Churches</h2>
            <ul class="list">
                <li v-for="church in churches" :key="church.id">
                    {{ church.name }}
                    <button @click="editChurch(church)" class="edit-button">Edit</button>
                    <button @click="deleteChurch(church._id)" class="delete-button">Delete</button>
                </li>
            </ul>
        </div>

        <!-- CREATE TEMPLATE SECTION -->
        <div class="section">
            <h2 class="subtitle">Create Template</h2>
            <form @submit.prevent="createTemplate" class="form">
                <input v-model="templateName" type="text" placeholder="Template Name" class="input-field" />
                <input v-model="templateDescription" type="text" placeholder="Description" class="input-field" />
                <button type="submit" class="submit-button">Create Template</button>
            </form>
        </div>

        <!-- LIST & MANAGE TEMPLATES -->
        <div class="section">
            <h2 class="subtitle">All Templates</h2>
            <ul class="list">
                <li v-for="template in templates" :key="template.id">
                    {{ template.name }} - {{ template.description }}
                    <button @click="editTemplate(template)" class="edit-button">Edit</button>
                    <button @click="deleteTemplate(template._id)" class="delete-button">Delete</button>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import api from "../services/api";
import { useRouter } from "vue-router";
 
export default {
    data() {
        return {
            churchName: "",
            adminName: "",
            adminEmail: "",
            adminPassword: "",
            templateName: "",
            templateDescription: "",
            churches: [],
            templates: [],
        };
    },
    setup() {
        const router = useRouter();
        return { router };
    },
    async created() {
        await this.fetchChurches();
        await this.fetchTemplates();
    },
    methods: {
        async fetchChurches() {
            const response = await api.get("/churches");
            this.churches = response.data;
        },
        async fetchTemplates() {
            const response = await api.get("/templates");
            this.templates = response.data;
        },
        async createChurch() {
            await api.post("/churches/create", { 
                    churchName: this.churchName,
                    adminName: this.adminName,
                    adminEmail: this.adminEmail,
                    adminPassword: this.adminPassword, 
                });
            await this.fetchChurches();
            this.churchName = "";
        },
        async deleteChurch(id) {
            await api.delete(`/churches/delete/${id}`);
            await this.fetchChurches();
        },
        async createTemplate() {
            await api.post("/templates/create", { name: this.templateName, description: this.templateDescription });
            await this.fetchTemplates();
            this.templateName = this.templateDescription = "";
        },
        async deleteTemplate(id) {
            await api.delete(`/templates/delete/${id}`);
            await this.fetchTemplates();
        },

        logout() {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("churchId");
            this.router.push("/login");
        },
    },
};
</script>

<style scoped>
/* Container */
.container {
    width: 60%;
    margin: 40px auto;
    padding: 30px;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
}

/* Title */
.title {
    font-size: 28px;
    font-weight: bold;
    color: #333;
    margin-bottom: 20px;
}

/* Logout Button */
.logout-button {
    background: #dc3545;
    color: white;
    padding: 10px 15px;
    font-size: 14px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.logout-button:hover {
    background: #c82333;
}

/* Section Styling */
.section {
    margin-top: 30px;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.08);
}

/* Subtitle */
.subtitle {
    font-size: 20px;
    font-weight: bold;
    color: #444;
    margin-bottom: 15px;
}

/* Form Styling */
.form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
}

/* Input Fields */
.input-field {
    width: 80%;
    padding: 12px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 6px;
    outline: none;
    transition: border 0.3s ease;
}

.input-field:focus {
    border-color: #007bff;
}

/* Select Dropdown */
.input-field select {
    width: 100%;
    padding: 10px;
}

/* Submit Button */
.submit-button {
    width: 80%;
    padding: 12px;
    background-color: #007bff;
    color: white;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.submit-button:hover {
    background-color: #0056b3;
}

.list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background: #fff;
    margin-bottom: 5px;
    border-radius: 5px;
}

.edit-button {
    background: #ffa500;
    color: white;
    padding: 5px 10px;
    border: none;
    cursor: pointer;
    margin-right: 5px;
}

.delete-button {
    background: #ff0000;
    color: white;
    padding: 5px 10px;
    border: none;
    cursor: pointer;
}

</style>
