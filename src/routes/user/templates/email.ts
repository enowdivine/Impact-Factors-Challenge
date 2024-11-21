export function userSignup(username: string, code: number) {
  return `
            <h3>Hi ${username},</h3>
            <p>
            Welcome to Bliss Dating! We're excited to have you join our platform.
            Use the code: ${code} to verify that your email address.
            </p>
            <p>
            Best Regards
            </p>
           <p>
              Bliss Dating Team
           </p>
  `;
}

export function matchNotification(username: string, matchName: string) {
  return `
    <h3>Hi ${username},</h3>
    <p>
      Great news! You and <strong>${matchName}</strong> have liked each other on Bliss Dating.
    </p>
    <p>
      It's a match! Start chatting now and see where this exciting connection takes you.
    </p>
    <p>
      Best Regards,
    </p>
    <p>
      Bliss Dating Team
    </p>
  `;
}
