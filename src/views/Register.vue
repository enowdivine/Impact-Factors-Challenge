<template>
    <div class="container">
        <h1 class="title">SuperAdmin Registration</h1>
        <form @submit.prevent="registerSuperAdmin" class="register-form">
            <input v-model="username" type="text" placeholder="Username" class="input-field" />
            <input v-model="email" type="email" placeholder="Email" class="input-field" />
            <input v-model="password" type="password" placeholder="Password" class="input-field" />
            <button type="submit" class="submit-button">Register</button>
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </form>
    </div>
</template>

<script>
import api from "../services/api";
import { useRouter } from "vue-router";

export default {
    data() {
        return { username: "", email: "", password: "", errorMessage: "" };
    },
    setup() {
        const router = useRouter();
        return { router };
    },
    methods: {
        async registerSuperAdmin() {
            try {
                await api.post("/admins/register", {
                    username: this.username,
                    email: this.email,
                    password: this.password,
                });
                this.router.push("/login");
            } catch (error) {
                this.errorMessage = error.response?.data?.message || "Registration failed";
            }
        },
    },
};
</script>


<style scoped>
/* Container Styling */
.container {
    width: 40%;
    margin: 80px auto;
    padding: 30px;
    background-color: #f9f9f9;
    text-align: center;
    border-radius: 10px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

/* Title Styling */
.title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 20px;
}

/* Form Styling */
.register-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

/* Input Fields */
.input-field {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 5px;
    outline: none;
    transition: border 0.3s ease;
}

.input-field:focus {
    border-color: #007bff;
}

/* Submit Button */
.submit-button {
    width: 100%;
    padding: 12px;
    background-color: #007bff;
    color: white;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.submit-button:hover {
    background-color: #0056b3;
}

.error-message {
    color: red;
    margin-top: 10px;
}
</style>
