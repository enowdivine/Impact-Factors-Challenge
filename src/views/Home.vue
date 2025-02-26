<template>
    <div class="container">
        <h1 class="title">Welcome to Our Multi-Tenant App</h1>
        <router-link to="/login" class="link">Login</router-link>
        <router-link to="/register" class="link">Register</router-link>
    </div>
</template>

<style scoped>
.container {
    width: 60%;
    margin: 50px auto;
    padding: 20px;
    background-color: white;
    text-align: center;
    border-radius: 10px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 20px;
}

.link {
    display: inline-block;
    margin: 10px;
    color: #007bff;
    text-decoration: none;
    font-size: 18px;
}

.link:hover {
    text-decoration: underline;
    color: #0056b3;
}
</style>
