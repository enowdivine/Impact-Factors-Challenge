<template>
    <div class="form-builder-container">
        <h2 class="title">Drag & Drop Form Builder</h2>

        <div class="form-builder">
            <!-- Field Toolbox -->
            <div class="toolbox">
                <h3>Available Fields</h3>
                <draggable
                    v-model="availableFields"
                    group="fields"
                    item-key="name"
                    class="field-list"
                >
                    <template #item="{ element }">
                        <div class="field-item">{{ element.label }}</div>
                    </template>
                </draggable>
            </div>

            <!-- Droppable Form Area -->
            <div class="form-area">
                <h3>Form Preview</h3>
                <draggable
                    v-model="formFields"
                    group="fields"
                    item-key="name"
                    class="form-list"
                >
                    <template #item="{ element, index }">
                        <div class="form-field">
                            <label>{{ element.label }}</label>
                            <input v-if="element.type === 'text'" type="text" class="input-field" :placeholder="element.placeholder" />
                            <input v-if="element.type === 'email'" type="email" class="input-field" :placeholder="element.placeholder" />
                            <input v-if="element.type === 'date'" type="date" class="input-field" />
                            <input v-if="element.type === 'checkbox'" type="checkbox" class="checkbox-field" />
                            <button class="delete-button" @click="removeField(index)">X</button>
                        </div>
                    </template>
                </draggable>
            </div>
        </div>

        <!-- Save Form -->
        <button class="submit-button" @click="saveForm">Save Form</button>
    </div>
</template>

<script>
import draggable from "vuedraggable";
import api from "@/services/api";

export default {
    components: { draggable },
    data() {
        return {
            availableFields: [
                { label: "Text Input", type: "text", name: "text", placeholder: "Enter text" },
                { label: "Email Input", type: "email", name: "email", placeholder: "Enter email" },
                { label: "Date Picker", type: "date", name: "date" },
                { label: "Checkbox", type: "checkbox", name: "checkbox" },
            ],
            formFields: [],
        };
    },
    methods: {
        removeField(index) {
            this.formFields.splice(index, 1);
        },
        async saveForm() {
            try {
                const response = await api.post("/forms/create", {
                    churchId: "YOUR_CHURCH_ID",
                    name: "New Form",
                    fields: this.formFields,
                });
                console.log("Form saved:", response.data);
                alert("Form saved successfully!");
            } catch (error) {
                console.error("Error saving form:", error);
            }
        },
    },
};
</script>

<style scoped>
.form-builder-container {
    width: 60%;
    margin: 40px auto;
    padding: 30px;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
}

/* Form Builder Layout */
.form-builder {
    display: flex;
    gap: 20px;
    margin-top: 20px;
}

/* Toolbox */
.toolbox {
    flex: 1;
    background: #f4f4f4;
    padding: 10px;
    border-radius: 5px;
}

.field-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.field-item {
    padding: 10px;
    background: #007bff;
    color: white;
    text-align: center;
    border-radius: 5px;
    cursor: grab;
}

/* Form Area */
.form-area {
    flex: 2;
    background: #f9f9f9;
    padding: 15px;
    border-radius: 5px;
    min-height: 200px;
}

.form-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.form-field {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 5px;
}

.input-field {
    flex: 1;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.checkbox-field {
    width: 20px;
    height: 20px;
}

.delete-button {
    background: #dc3545;
    color: white;
    border: none;
    padding: 5px;
    cursor: pointer;
    border-radius: 3px;
}

/* Submit Button */
.submit-button {
    margin-top: 20px;
    padding: 12px;
    background-color: #28a745;
    color: white;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.submit-button:hover {
    background-color: #218838;
}
</style>
