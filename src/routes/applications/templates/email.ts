export function newApplication(
  username: string,
  program: string,
  university: string
) {
  return `
            <h3>Dear ${username},</h3>
            <p>
            Thank you for applying for the ${program} at ${university}! 
            Your application has been successfully received.
            </p>
            <p>
            Our team will review your application and keep you updated on its status. 
            Meanwhile, please ensure all required documents are submitted promptly. 
            Should you have any questions, feel free to contact us.
            </p>
            <p>
            Best Regards
            </p>
           <p>
              Campus Camer Team
           </p>
  `;
}

export function processingApplication(
  username: string,
  program: string,
  university: string
) {
  return `
            <h3>Dear ${username},</h3>
            <p>
            We are pleased to inform you that your application to ${university} is currently being processed. 
            Our team is working diligently to ensure a smooth and timely evaluation. 
            </p>
            <p>
            We will keep you updated throughout the process.
            Should you have any questions, feel free to reach out to us.
            </p>
            <p>
            Best Regards
            </p>
           <p>
              Campus Camer Team
           </p>
  `;
}

export function rejectedApplication(
  username: string,
  program: string,
  university: string
) {
  return `
            <h3>Dear ${username},</h3>
            <p>
            We regret to inform you that your application to ${university} has been unsuccessful at this time. 
            We understand this may be disappointing news, and we are here to assist you with any questions you may have regarding the decision.
            </p>
            <p>
            Thank you for considering ${university}. We wish you all the best in your future endeavors. 
            </p>
            <p>
            Best Regards
            </p>
           <p>
              Campus Camer Team
           </p>
  `;
}

export function acceptedApplication(
  username: string,
  program: string,
  university: string
) {
  return `
            <h3>Dear ${username},</h3>
            <p>
            Congratulations! We are happy to inform you that your application to ${university} has been accepted! 
            This is a significant achievement, and we are excited to support you as you prepare for this next chapter.
            </p>
            <p>
            Please follow the instructions provided to proceed with enrollment.
            </p>
            <p>
            Best Regards
            </p>
           <p>
              Campus Camer Team
           </p>
  `;
}
