<template>
    <section class="section">
        <h2 class="subtitle">Choose a Website Template</h2>
        <div class="template-list">
            <div v-for="template in templates" :key="template.id" class="template-card">
                <h3>{{ template.name }}</h3>
                <button @click="publishTemplate(template.id)" class="publish-button">Publish</button>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    props: ["templates"],
    methods: {
        async publishTemplate(templateId) {
            await this.$emit("publishTemplate", templateId);
        },
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

/* Template List */
.template-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    padding: 10px;
}

/* Template Card */
.template-card {
    background: #f9f9f9;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease-in-out;
}

.template-card:hover {
    transform: translateY(-5px);
}

/* Template Name */
.template-card h3 {
    font-size: 1.3rem;
    font-weight: bold;
    color: #444;
    margin-bottom: 10px;
}

/* Publish Button */
.publish-button {
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    font-size: 14px;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s ease-in-out;
}

.publish-button:hover {
    background-color: #0056b3;
}
</style>
