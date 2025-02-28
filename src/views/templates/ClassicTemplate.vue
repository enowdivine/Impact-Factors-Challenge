<template>
    <div class="modern-template">
        <h1>Welcome to {{ church.name }}</h1>
        <p>This is the Modern Template.</p>
        <p>Subdomain: {{ church.subdomain }}</p>
    </div>
</template>

<script>
export default {
    props: {
        church: Object, // Accept church data
    },
};
</script>

<style scoped>
.modern-template {
    text-align: center;
    padding: 40px;
    background: #f4f4f4;
}
</style>
