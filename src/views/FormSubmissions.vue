<template>
    <section class="section">
        <h2 class="subtitle">Form Submissions</h2>
        
        <!-- 🔄 Loading State -->
        <p v-if="loading">Loading submissions...</p>
        <p v-if="!loading && submissions.length === 0">No submissions yet.</p>

        <ul v-if="!loading && submissions.length > 0" class="list">
            <li v-for="submission in submissions" :key="submission._id" class="submission-item">
                <strong>{{ submission.formName }}</strong> - <span>{{ formatDate(submission.submittedAt) }}</span>
                <button @click="viewDetails(submission)" class="view-button">View</button>
            </li>
        </ul>

        <!-- 🔥 Submission Details Modal -->
        <div v-if="selectedSubmission" class="modal">
            <div class="modal-content">
                <h2>Submission Details</h2>
                <p><strong>Form Name:</strong> {{ selectedSubmission.formName }}</p>
                <p><strong>Submitted At:</strong> {{ formatDate(selectedSubmission.submittedAt) }}</p>

                <div v-for="(value, key) in selectedSubmission.data" :key="key">
                    <p><strong>{{ key }}:</strong> {{ value }}</p>
                </div>

                <button @click="selectedSubmission = null" class="close-button">Close</button>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    props: {
        submissions: Array, // 🔥 Receive submissions as a prop
    },
    data() {
        return {
            selectedSubmission: null,
        };
    },
    methods: {
        viewDetails(submission) {
            this.selectedSubmission = submission;
        },
        formatDate(date) {
            return new Date(date).toLocaleString();
        }
    }
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

/* Submission List */
.list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* Submission Item */
.submission-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f9f9f9;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease-in-out;
}

.submission-item:hover {
    transform: scale(1.02);
}

/* View Button */
.view-button {
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

.view-button:hover {
    background-color: #0056b3;
}

/* Modal */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 400px;
    text-align: center;
}

.close-button {
    background: #dc3545;
    color: white;
    padding: 10px;
    border: none;
    cursor: pointer;
}
</style>
