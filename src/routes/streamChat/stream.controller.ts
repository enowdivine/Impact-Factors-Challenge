import { StreamChat } from "stream-chat";

const apiKey = "8dj2gg5p9x6m";
const apiSecret =
  "rpt2crsz8rqdehrmqztdqypcg33wkmxdkutr54cymf9kdtchztjbvxk75cqfmzms";

const serverClient = StreamChat.getInstance(apiKey, apiSecret);

// Function to generate token
export async function generateToken(
  userId: any,
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  profilePictureUrl: string
): Promise<{ success: boolean; token?: string; message?: string }> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Ensure the user exists on Stream
    await serverClient.upsertUser({
      id: userId,
      firstName,
      lastName,
      username,
      email,
      image: profilePictureUrl,
    });

    // Create a token for the user
    const token = serverClient.createToken(userId);

    return { success: true, token };
  } catch (error) {
    console.error("Error generating token:", error);
    return { success: false, message: "Error generating token" };
  }
}
