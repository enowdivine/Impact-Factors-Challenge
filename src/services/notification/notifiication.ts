import axios from "axios";

// Define the type for the message object
interface NotificationMessage {
  title: string;
  body: string;
  data?: Record<string, any>; // Optional data object
}

// Function to send a push notification using Expo's push notification service
export const sendPushNotification = async (
  expoPushToken: string,
  message: NotificationMessage
): Promise<void> => {
  try {
    // Ensure the token is a valid Expo push token
    if (!expoPushToken.startsWith("ExponentPushToken")) {
      throw new Error("Invalid Expo push token");
    }

    const response = await axios.post(
      "https://exp.host/--/api/v2/push/send",
      {
        to: expoPushToken,
        sound: "default",
        title: message.title,
        body: message.body,
        data: message.data, // Optional: Pass additional data if needed
      },
      {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Push notification response:", response.data);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};
