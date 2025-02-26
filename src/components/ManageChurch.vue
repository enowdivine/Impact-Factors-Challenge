<template>
    <section class="section">
        <h2 class="subtitle">Manage Church Details</h2>
        <form @submit.prevent="updateChurch" class="form-container">
            <div class="input-group">
                <label>Church Name</label>
                <input v-model="church.name" type="text" placeholder="Church Name" class="input-field" required />
            </div>

            <div class="input-group">
                <label>Church Subdomain</label>
                <input v-model="church.subdomain" type="text" placeholder="Church Subdomain" class="input-field" required />
            </div>

            <div class="button-group">
                <button type="submit" class="submit-button">Update Church</button>
                <button type="button" @click="deleteChurch" class="delete-button">Delete Church</button>
            </div>
        </form>
    </section>
</template>

<script>
export default {
    props: ["church"],
    methods: {
        async updateChurch() {
            await this.$emit("updateChurch");
        },
        async deleteChurch() {
            await this.$emit("deleteChurch");
        },
    },
};
</script>

<style scoped>
/* Section Wrapper */
.section {
    background: #f9f9f9;
    padding: 25px;
    margin: 20px 0;
    border-radius: 10px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}

/* Subtitle */
.subtitle {
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 15px;
    color: #333;
}

/* Form Container */
.form-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* Input Group */
.input-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

label {
    font-weight: bold;
    color: #555;
}

/* Input Fields */
.input-field {
    width: 100%;
    padding: 12px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 8px;
    outline: none;
    transition: border 0.3s ease-in-out;
}

.input-field:focus {
    border-color: #007bff;
}

/* Button Group */
.button-group {
    display: flex;
    gap: 15px;
    justify-content: center;
}

/* Submit Button */
.submit-button {
    padding: 12px 20px;
    background-color: #007bff;
    color: white;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s ease-in-out;
}

.submit-button:hover {
    background-color: #0056b3;
}

/* Delete Button */
.delete-button {
    padding: 12px 20px;
    background-color: #ff4d4d;
    color: white;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s ease-in-out;
}

.delete-button:hover {
    background-color: #cc0000;
}
</style>
