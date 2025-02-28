<template>
    <div class="container">
        <!-- Header & Logout -->
        <header class="dashboard-header">
            <h1 class="title">Church Admin Dashboard</h1>
            <button @click="logout" class="logout-button">Logout</button>
        </header>

        <ChurchOverview :church="church" />
        <ManageChurch :church="church" @updateChurch="updateChurch" @deleteChurch="deleteChurch" />
        <Templates :templates="templates" @publishTemplate="publishTemplate" />

       

        <!-- Toggle Button to Show/Hide Form Builder -->
        <button v-if="!editingForm" @click="toggleFormBuilder" class="toggle-button">
            {{ showFormBuilder ? "Close Form Builder" : "Open Form Builder" }}
        </button>

         <button @click="goToSiteBuilder" class="site-builder-button">Go to Site Builder</button>

        <!-- Form Builder Component (Create New or Edit Existing) -->
        <FormBuilder 
            v-if="showFormBuilder || editingForm" 
            :churchId="church._id" 
            :formToEdit="editingForm"
            @formSaved="fetchForms"
            @formUpdated="fetchForms"
            @closeForm="closeFormEditor"
        />

        <!-- Manage Forms Component -->
        <ManageForms :forms="forms" @editForm="openFormEditor" @deleteForm="deleteForm" />

        <!-- 🔥 View Submissions -->
        <FormSubmissions :submissions="submissions" />
    </div>
</template>

<script>
import api from "../services/api";
import { useRoute, useRouter } from "vue-router";
import ChurchOverview from "../components/ChurchOverview.vue";
import ManageChurch from "../components/ManageChurch.vue";
import Templates from "../components/Templates.vue";
import FormBuilder from "../components/FormBuilder.vue";
import ManageForms from "../components/ManageForms.vue";
import FormSubmissions from "./FormSubmissions.vue";

export default {
    components: { ChurchOverview, ManageChurch, Templates, FormBuilder, ManageForms, FormSubmissions },
    data() {
        return {
            church: { name: "", subdomain: "", published: false },
            templates: [],
            forms: [],
            submissions: [], // 🔥 Store form submissions
            showFormBuilder: false, // Show form builder for creating new forms
            editingForm: null, // Store the form being edited
        };
    },
    async created() {
        const route = useRoute();
        const churchId = route.params.churchId;

        await this.fetchChurch(churchId);
        await this.fetchTemplates();
        await this.fetchForms(churchId);
        await this.fetchSubmissions(churchId);
    },
    setup() {
        const router = useRouter();
        return { router };
    },
    methods: {
        async fetchChurch(churchId) {
            const response = await api.get(`/churches/${churchId}`);
            this.church = response.data;
        },
        async updateChurch() {
            await api.put(`/churches/update/${this.church._id}`, { name: this.church.name, subdomain: this.church.subdomain });
        },
        async deleteChurch() {
            await api.delete(`/churches/delete/${this.church._id}`);
        },
        async fetchTemplates() {
            const response = await api.get("/templates");
            this.templates = response.data;
        },
        async publishTemplate(templateId) {
            await api.post(`/templates/assign`, { churchId: this.church._id, templateId });
            this.church.published = true;
            this.fetchChurch(this.church._id);
        },
        async fetchForms(churchId) {
            const response = await api.get(`/forms/church/${churchId}`);
            this.forms = response.data;
        },
        async fetchSubmissions(churchId) {
        try {
            const response = await api.get(`/forms/churches/${churchId}/submissions`);
            this.submissions = response.data.submissions; // 🔥 Store all submissions
        } catch (error) {
            console.error("❌ Error fetching submissions:", error);
            }
        },

        async deleteForm(formId) {
            try {
                    await api.delete(`/forms/delete/${formId}`);
                    alert("Form deleted successfully!");
                    this.fetchForms(this.church._id);
                } catch (error) {
                    console.error("Error deleting form:", error);
                    alert("Error deleting form. Please try again.");
                }
        },

        goToSiteBuilder() {
            this.router.push(`/church/${this.church._id}/site-builder`);
        },

        // Toggle Form Builder for Creating New Form
        toggleFormBuilder() {
            this.showFormBuilder = !this.showFormBuilder;
            this.editingForm = null; // Ensure we're not in edit mode
        },

        // Open Form Editor for Editing an Existing Form
        openFormEditor(form) {
            this.editingForm = form;
            this.showFormBuilder = false; // Hide the new form builder
        },

        // Close Form Editor
        closeFormEditor() {
            this.editingForm = null;
            this.showFormBuilder = false;
        },

        logout() {
            localStorage.removeItem("token");
            this.router.push("/login");
        },
    },
};
</script>



<style scoped>
/* Toggle Button */
.toggle-button {
    width: 40%;
    padding: 12px;
    background-color: #007bff;
    color: white;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-bottom: 20px;
}

.toggle-button:hover {
    background-color: #0056b3;
}

.site-builder-button{
    width: 40%;
    padding: 12px;
    background-color: #007bff;
    color: white;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-bottom: 20px;
    margin-left: 30px;
}
</style>
