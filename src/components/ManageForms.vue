<template>
    <section class="section">
        <h2 class="subtitle">Manage Forms</h2>
        <ul class="list">
            <li v-for="form in forms" :key="form._id" class="form-item">
                <strong class="form-name">{{ form.name }}</strong>
                <div>
                    <button @click="editForm(form)" class="edit-button">Edit</button>
                    <button @click="deleteForm(form._id)" class="delete-button">Delete</button>
                </div>
            </li>
        </ul>
    </section>
</template>

<script>
export default {
    props: ["forms"],
    methods: {
        editForm(form) {
            this.$emit("editForm", form); // Emit event to parent to handle editing
        },
        deleteForm(formId) {
            if (confirm("Are you sure you want to delete this form?")) {
                this.$emit("deleteForm", formId);
            }
        }
    },
};
</script>


<style scoped>
/* Section Styling */
.section {
    background: #ffffff;
    padding: 25px;
    margin: 20px 0;
    border-radius: 10px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
}

/* Subtitle */
.subtitle {
    font-size: 1.6rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
}

/* Form List */
.list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* Form Item */
.form-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f9f9f9;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease-in-out;
}

.form-item:hover {
    transform: scale(1.02);
}

/* Form Name */
.form-name {
    font-size: 1.2rem;
    color: #444;
}

/* Edit Button */
.edit-button {
    padding: 8px 15px;
    background-color: #007bff;
    color: white;
    font-size: 14px;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s ease-in-out;
}

.edit-button:hover {
    background-color: #0056b3;
}

.delete-button {
    background-color: #dc3545;
    color: white;
    margin-left: 10px;
     cursor: pointer;
}

.delete-button:hover {
    background-color: #c82333;
}
</style>
