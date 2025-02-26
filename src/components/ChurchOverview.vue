<template>
    <section class="section">
        <h2 class="subtitle">Church Overview</h2>
        <div class="overview-content">
            <p><strong>Name:</strong> {{ church.name }}</p>
            <p><strong>Subdomain:</strong> {{ church.subdomain }}</p>
            <p>
                <strong>Website Status:</strong>
                <span class="status" :class="{ active: church.published, inactive: !church.published }">
                    {{ church.published ? "Active" : "Inactive" }}
                </span>
            </p>
        </div>
    </section>
</template>

<script>
export default {
    props: ["church"],
};
</script>

<style scoped>
/* Section Container */
.section {
    background: #ffffff;
    padding: 25px;
    margin: 20px 0;
    border-radius: 10px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
}

/* Title */
.subtitle {
    font-size: 1.6rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
}

/* Content */
.overview-content {
    font-size: 1.1rem;
    color: #555;
    line-height: 1.6;
}

/* Website Status Indicator */
.status {
    padding: 5px 12px;
    font-weight: bold;
    border-radius: 5px;
}

/* Active (Published) */
.active {
    background-color: #28a745;
    color: white;
}

/* Inactive (Not Published) */
.inactive {
    background-color: #ff4d4d;
    color: white;
}
</style>
