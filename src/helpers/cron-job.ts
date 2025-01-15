// import cron from "node-cron";
// import User from "./path/to/user.model";
// import sendEmail from "./path/to/emailService";

// // Schedule the job to run every 10 minutes
// cron.schedule("*/10 * * * *", async () => {
//   try {
//     const now = Date.now();
//     const oneHourAgo = new Date(now - 60 * 60 * 1000); // 1 hour ago
//     const warningThreshold = new Date(now - 50 * 60 * 1000); // 50 minutes ago

//     // Send warning emails to users created more than 50 minutes ago but less than 1 hour ago
//     const unverifiedUsersToWarn = await User.find({
//       emailVerified: false,
//       createdAt: { $gte: warningThreshold, $lt: oneHourAgo },
//     });

//     for (const user of unverifiedUsersToWarn) {
//       await sendEmail({
//         to: user.email,
//         subject: "Verify Your Email Now!",
//         message: `Hi ${user.firstName}, your account will be deleted in 10 minutes if you do not verify your email.`,
//       });
//     }

//     console.log(`Sent warnings to ${unverifiedUsersToWarn.length} users.`);

//     // Delete users who were created more than 1 hour ago and are still unverified
//     const result = await User.deleteMany({
//       emailVerified: false,
//       createdAt: { $lt: oneHourAgo },
//     });

//     console.log(`Deleted ${result.deletedCount} unverified users.`);
//   } catch (error) {
//     console.error("Error during user cleanup or warnings:", error);
//   }
// });
