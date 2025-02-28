<template>
    <div v-if="loading" class="loading">
        <p>Loading template...</p>
    </div>

    <div v-else-if="church" class="modern-template">
        <h1>Welcome to {{ church.name }}</h1>
        <p>This is the Modern Template.</p>
        <p>Subdomain: {{ church.subdomain }}</p>

        <div v-if="template" class="template-details">
            <h2>Template Details</h2>
            <p><strong>Name:</strong> {{ template.name }}</p>
            <p><strong>Description:</strong> {{ template.description }}</p>
        </div>

        <!-- 🔥 Display Assigned Forms -->
        <div v-if="assignedForms.length > 0" class="forms-section">
            <h2>Available Forms</h2>
            <ul class="form-list">
                <li v-for="form in assignedForms" :key="form._id">
                    <strong>{{ form.name }}</strong>
                    <button @click="openForm(form)" class="form-button">Fill Form</button>
                </li>
            </ul>
        </div>
    </div>

    <div v-else class="error">
        <p>Church not found or unavailable.</p>
    </div>

    <!-- 🔥 Modal for Filling Forms -->
    <div v-if="selectedForm" class="form-modal">
        <div class="modal-content">
            <h2>{{ selectedForm.name }}</h2>
            <form @submit.prevent="submitForm">
                <div v-for="(field, index) in selectedForm.fields" :key="index">
                    <label>{{ field.label }}</label>

                    <input v-if="field.type === 'text'" v-model="formData[field.label]" type="text"
                        class="input-field" />

                    <input v-if="field.type === 'email'" v-model="formData[field.label]" type="email"
                        class="input-field" />

                    <input v-if="field.type === 'date'" v-model="formData[field.label]" type="date"
                        class="input-field" />

                    <input v-if="field.type === 'checkbox'" v-model="formData[field.label]" type="checkbox"
                        class="checkbox-field" />
                </div>

                <button type="submit" class="submit-button">Submit</button>
                <button @click="selectedForm = null" class="close-button">Close</button>
            </form>


        </div>
    </div>
</template>

<script>
import api from "../services/api";
import { useRoute } from "vue-router";

export default {
    data() {
        return {
            church: null, // Store church details
            template: null, // Store template details
            assignedForms: [], // Store assigned forms
            selectedForm: null, // Currently selected form
            formData: {}, // User input for form submission
            loading: true,
        };
    },
    async created() {
        const route = useRoute();
        const subdomain = route.params.subdomain; // Get subdomain from the URL

        if (subdomain) {
            try {
                const response = await api.get(`/churches/subdomain/${subdomain}.localhost`);
                this.church = response.data;

                // Fetch template details if assigned
                if (this.church.templateId) {
                    const templateResponse = await api.get(`/templates/${this.church.templateId}`);
                    this.template = templateResponse.data;
                }

                // Fetch assigned forms
                if (this.church.assignedForms.length > 0) {
                    const formsResponse = await api.get(`/churches/${this.church._id}/assigned-forms`);
                    this.assignedForms = formsResponse.data.assignedForms;
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                this.church = null; // Handle not found
            }
        }
        this.loading = false;
    },
    methods: {
        openForm(form) {
            this.selectedForm = form;
            this.formData = {}; // Reset form data
        },
        async submitForm() {
            try {
                await api.post("/forms/submit", {
                    formId: this.selectedForm._id,
                    data: this.formData,
                });
                alert("Form submitted successfully!");
                this.selectedForm = null; // Close modal
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        },
    },
};
</script>

<style scoped>
.modern-template {
    text-align: center;
    padding: 40px;
    background: #f4f4f4;
}

.loading,
.error {
    text-align: center;
    padding: 40px;
    font-size: 18px;
    font-weight: bold;
}

.template-details {
    margin-top: 20px;
    padding: 15px;
    background: white;
    border-radius: 8px;
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
}

/* 🔥 Form List */
.forms-section {
    margin-top: 30px;
}

.form-list {
    list-style: none;
    padding: 0;
}

.form-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 10px;
    margin: 5px 0;
    border-radius: 6px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

/* 🔥 Form Buttons */
.form-button {
    background: #007bff;
    color: white;
    padding: 8px;
    border: none;
    cursor: pointer;
}

.form-button:hover {
    background: #0056b3;
}

/* 🔥 Form Modal */
.form-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 400px;
    text-align: center;
}

.input-field {
    width: 100%;
    padding: 8px;
    margin: 5px 0;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.submit-button {
    background: #28a745;
    color: white;
    padding: 10px;
    border: none;
    cursor: pointer;
}

.close-button {
    background: #dc3545;
    color: white;
    padding: 10px;
    border: none;
    cursor: pointer;
    margin-top: 10px;
}
</style>
