<template>
    <div class="form-builder-container">
        <h2 class="title">{{ isEditing ? "Edit Form" : "Create Form" }}</h2>

        <!-- Form Name Input -->
        <div class="form-name-input">
            <label>Form Name:</label>
            <input v-model="formName" type="text" placeholder="Enter form name" class="input-field" required />
        </div>

        <div class="form-builder">
            <!-- Field Toolbox -->
            <div class="toolbox">
                <h3>Available Fields</h3>
                <draggable
                    v-model="availableFields"
                    :group="{ name: 'fields', pull: 'clone', put: false }"
                    :sort="false"
                    item-key="id"
                    class="field-list"
                >
                    <template #item="{ element }">
                        <div class="field-item" @click="addField(element)">
                            {{ element.label }}
                        </div>
                    </template>
                </draggable>
            </div>

            <!-- Droppable Form Area -->
            <div class="form-area">
                <h3>Form Preview</h3>
                <draggable v-model="formFields" group="fields" item-key="id" class="form-list">
                    <template #item="{ element, index }">
                        <div class="form-field">
                            <input v-model="element.label" class="field-label" />
                            <input v-if="element.type === 'text'" v-model="element.placeholder" type="text" class="input-field" />
                            <input v-if="element.type === 'email'" v-model="element.placeholder" type="email" class="input-field" />
                            <input v-if="element.type === 'date'" type="date" class="input-field" />
                            <input v-if="element.type === 'checkbox'" type="checkbox" class="checkbox-field" />
                            <button class="delete-button" @click="removeField(index)">X</button>
                        </div>
                    </template>
                </draggable>
            </div>
        </div>

        <!-- Save or Update Form -->
        <button class="submit-button" @click="isEditing ? updateForm() : saveForm()">
            {{ isEditing ? "Update Form" : "Save Form" }}
        </button>
        <button class="close-button" @click="$emit('closeForm')">Cancel</button>
    </div>
</template>

<script>
import draggable from "vuedraggable";
import api from "../services/api";

export default {
    components: { draggable },
    props: ["churchId", "formToEdit"],
    data() {
        return {
            isEditing: false,
            formId: null,
            formName: "",
            availableFields: [
                { id: 1, label: "Text Input", type: "text", placeholder: "Enter text" },
                { id: 2, label: "Email Input", type: "email", placeholder: "Enter email" },
                { id: 3, label: "Date Picker", type: "date" },
                { id: 4, label: "Checkbox", type: "checkbox" },
            ],
            formFields: [],
        };
    },
    created() {
        if (this.formToEdit) {
            this.loadFormData();
        }
    },
    methods: {
        loadFormData() {
            this.isEditing = true;
            this.formId = this.formToEdit._id;
            this.formName = this.formToEdit.name;
            this.formFields = [...this.formToEdit.fields];
        },
        addField(field) {
            this.formFields.push({ ...field, id: Date.now() });
        },
        removeField(index) {
            this.formFields.splice(index, 1);
        },
        async updateForm() {
            await api.put(`/forms/update/${this.formId}`, { name: this.formName, fields: this.formFields });
            alert("Form updated successfully!");
            this.$emit("formUpdated");
        },
        async saveForm() {
            await api.post("/forms/create", { churchId: this.churchId, name: this.formName, fields: this.formFields });
            alert("Form saved successfully!");
            this.$emit("formSaved");
        },
    },
};
</script>


<style scoped>
/* Form Builder Styling */
.form-builder-container {
    width: 70%;
    margin: 40px auto;
    padding: 30px;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
}

/* Title */
.title {
    font-size: 1.8rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 20px;
}

/* Form Name Input */
.form-name-input {
    margin-bottom: 15px;
}

.form-name-input label {
    font-size: 1.1rem;
    font-weight: bold;
    display: block;
    margin-bottom: 5px;
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
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
}

.field-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* Field Item */
.field-item {
    padding: 10px;
    background: #007bff;
    color: white;
    text-align: center;
    border-radius: 5px;
    cursor: grab;
    transition: background 0.3s ease-in-out, transform 0.2s;
}

.field-item:hover {
    background: #0056b3;
    transform: scale(1.05);
}

/* Form Area */
.form-area {
    flex: 2;
    background: #f9f9f9;
    padding: 15px;
    border-radius: 10px;
    min-height: 200px;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
}

/* Editable Fields */
.form-field {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    transition: transform 0.2s;
}

.field-label {
    width: 50%;
    border: none;
    font-weight: bold;
}

/* Delete Button */
.delete-button {
    background: #dc3545;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 5px;
}

.delete-button:hover {
    background: #c82333;
}

/* Save Button */
.submit-button {
    margin-top: 20px;
    padding: 12px;
    background-color: #28a745;
    color: white;
    font-size: 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}
</style>
