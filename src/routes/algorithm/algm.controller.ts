import { Request, Response } from "express";
import axios from "axios";
import { faker } from "@faker-js/faker";
import User from "../user/user.model";
import { QUESTIONS } from "./algm.data";

// Function to generate random user images from the Random User API
const fetchRandomImage = async () => {
  try {
    const response = await axios.get("https://randomuser.me/api/");
    const user = response.data.results[0];
    return {
      url: user.picture.large,
      key: user.login.uuid, // Unique identifier for each image
    };
  } catch (error) {
    console.error("Error fetching random image:", error);
    return { url: "", key: "" };
  }
};

// Function to generate a random user
const generateRandomUser = async () => {
  const profilePicture = await fetchRandomImage();
  const images = [await fetchRandomImage(), await fetchRandomImage()];

  return {
    role: "USER",
    profilePicture,
    images,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    emailVerified: faker.datatype.boolean(),
    password: "1234",
    isProfileCompleted: faker.datatype.boolean(),
    profilePrivacy: faker.datatype.boolean(),
    questionOne: faker.helpers.arrayElement(QUESTIONS.optionQuestions),
    answerOne: faker.lorem.sentence(),
    questionTwo: faker.helpers.arrayElement(QUESTIONS.optionQuestions),
    answerTwo: faker.lorem.sentence(),
    bio: faker.lorem.paragraph(),
    location: faker.address.city(),
    likedUsers: [],
    premium: {
      isPremium: faker.datatype.boolean(),
      plan: faker.helpers.arrayElement(["FREE", "BASIC", "PREMIUM"]),
      expiresIn: faker.date.future(),
    },
    gender: faker.helpers.arrayElement(QUESTIONS.gender),
    interestedGender: faker.helpers.arrayElement(QUESTIONS.interestedGender),
    age: faker.number.int({ min: QUESTIONS.age.min, max: QUESTIONS.age.max }),
    countryOfOrigin: {
      country: faker.address.country(),
      city: faker.address.city(),
    },
    currentLocation: {
      city: faker.address.city(),
      region: faker.address.state(),
      country: faker.address.country(),
      postalCode: faker.address.zipCode(),
    },
    maritalStatus: faker.helpers.arrayElement(QUESTIONS.maritalStatus),
    numberOfChildren: faker.helpers.arrayElement(QUESTIONS.children),
    height: faker.number.int({
      min: QUESTIONS.height.min,
      max: QUESTIONS.height.max,
    }),
    physique: faker.helpers.arrayElement(QUESTIONS.physique),
    interests: faker.helpers.arrayElements(QUESTIONS.interests, 3),
    practicedSports: faker.helpers.arrayElements(QUESTIONS.sports, 2),
    religion: faker.helpers.arrayElement(QUESTIONS.religion),
    importanceOfReligion: faker.helpers.arrayElement(
      QUESTIONS.religionImportance
    ),
    smoking: faker.helpers.arrayElement(QUESTIONS.smoking),
    educationLevel: faker.helpers.arrayElement(QUESTIONS.educationLevel),
    occupation: faker.name.jobTitle(),
    languages: faker.helpers.arrayElements(QUESTIONS.languagesSpoken, 2),
    personality: faker.helpers.arrayElements(QUESTIONS.personalityTraits, 3),
    importantInLife: faker.helpers.arrayElements(QUESTIONS.importantInLife, 2),
    values: faker.helpers.arrayElements(QUESTIONS.values, 2),
    wantMarriage: faker.helpers.arrayElement(QUESTIONS.wantMarriage),
    relationshipEssentials: faker.helpers.arrayElements(
      QUESTIONS.relationshipEssentials,
      2
    ),
    wantChildren: faker.helpers.arrayElement(QUESTIONS.wantChildren),
    returnToCountry: faker.helpers.arrayElement(QUESTIONS.returnToCountry),
    culturalValuesImportance: faker.helpers.arrayElement(
      QUESTIONS.culturalValuesImportance
    ),
    partnerFromOtherBackground: faker.helpers.arrayElement(
      QUESTIONS.partnerFromOtherBackground
    ),
    partnerFromSameCountry: faker.helpers.arrayElement(
      QUESTIONS.partnerFromSameCountry
    ),
    partnerInSameCountry: faker.helpers.arrayElement(
      QUESTIONS.partnerInSameCountry
    ),
    shareHouseholdTasks: faker.helpers.arrayElement(
      QUESTIONS.shareHouseholdTasks
    ),
    longTermCountries: faker.helpers.arrayElements(
      ["USA", "UK", "Canada", "Australia"],
      2
    ),
    partnerAge: {
      minValue: faker.number.int({ min: 20, max: 30 }),
      maxValue: faker.number.int({ min: 31, max: 50 }),
    },
    partnerEducationLevel: faker.helpers.arrayElement(
      QUESTIONS.partnerEducationLevel
    ),
    partnerAttraction: faker.helpers.arrayElements(
      QUESTIONS.partnerAttraction,
      2
    ),
    partnerPhysique: faker.helpers.arrayElement(QUESTIONS.partnerPhysique),
    partnerSmoking: faker.helpers.arrayElement(QUESTIONS.partnerSmoking),
    partnerHeight: {
      minValue: faker.number.int({
        min: QUESTIONS.partnerHeight.min,
        max: 170,
      }),
      maxValue: faker.number.int({
        min: 171,
        max: QUESTIONS.partnerHeight.max,
      }),
    },
    status: "ACTIVE",
  };
};

class AlgorithmController {
  async generateUsers(req: Request, res: Response) {
    try {
      const users = [];
      for (let i = 0; i < 1000; i++) {
        const user = await generateRandomUser();
        users.push(user);
      }

      try {
        await User.insertMany(users);
        console.log("1000 users generated and saved to the database.");
      } catch (error) {
        console.error("Error saving users:", error);
      }
    } catch (error: any) {
      console.log("Error generatiing users:", error);
    }
  }
}

export default AlgorithmController;
