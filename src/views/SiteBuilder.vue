<template>
    <div class="site-builder-container">
        <h1>Site Builder</h1>
        <p>Assign forms to your church website.</p>

        <h2>Available Forms</h2>
        <div v-if="forms.length">
            <ul class="form-list">
                <li v-for="form in forms" :key="form._id" class="form-item">
                    <span>{{ form.name }}</span>
                    <button
                        @click="assignFormToTemplate(form._id)"
                        :class="{ assigned: isFormAssigned(form._id) }"
                    >
                        {{ isFormAssigned(form._id) ? "Assigned" : "Assign" }}
                    </button>
                </li>
            </ul>
        </div>
        <div v-else>
            <p>No forms available.</p>
        </div>
    </div>
</template>

<script>
import api from "../services/api";
import { useRoute } from "vue-router";

export default {
    data() {
        return {
            churchId: null,
            forms: [],
            assignedForms: [],
        };
    },
    async created() {
        const route = useRoute();
        this.churchId = route.params.churchId;

        await this.fetchForms();
        await this.fetchAssignedForms();
    },
    methods: {
        async fetchForms() {
            const response = await api.get(`/forms/church/${this.churchId}`);
            this.forms = response.data;
        },
        async fetchAssignedForms() {
            const response = await api.get(`/churches/${this.churchId}/assigned-forms`);
            this.assignedForms = response.data.assignedForms || [];
        },
        isFormAssigned(formId) {
            return this.assignedForms.includes(formId);
        },
        async assignFormToTemplate(formId) {
            await api.post(`/churches/${this.churchId}/assign-form`, { formId });
            await this.fetchAssignedForms();
        },
    },
};
</script>

<style scoped>
.site-builder-container {
    max-width: 600px;
    margin: 40px auto;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
    text-align: center;
    margin-bottom: 20px;
}

.form-list {
    list-style: none;
    padding: 0;
}

.form-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f9f9f9;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 10px;
}

button {
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 5px;
    cursor: pointer;
}

button.assigned {
    background: #28a745;
}
</style>
