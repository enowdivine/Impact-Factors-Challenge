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

// Example Usage
// (async () => {
//   try {
//     const userId = "12345";
//     const firstName = "John";
//     const lastName = "Doe";
//     const email = "john.doe@example.com";
//     const profilePictureUrl = "https://example.com/profile.jpg";

//     const result = await generateToken(
//       userId,
//       firstName,
//       lastName,
//       email,
//       profilePictureUrl
//     );
//     if (result.success) {
//       console.log("Token generated:", result.token);
//     } else {
//       console.log("Error:", result.message);
//     }
//   } catch (err) {
//     console.error(err);
//   }
// })();
