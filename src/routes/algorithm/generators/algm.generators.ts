import axios from "axios";
import { faker } from "@faker-js/faker";
import { QUESTIONS } from "../algm.data";
import bcrypt from "bcrypt"; // Import bcrypt

// Define the Country object structure
interface Country {
  cca2: string;
  currency: string;
  callingCode: string;
  flag: string;
  name: string;
  region: string;
  subregion: string;
}

// Function to generate a random Country object
const generateRandomCountry = (): Country => {
  const europeanCountries: Country[] = [
    {
      cca2: "CH",
      currency: "CHF",
      callingCode: "41",
      flag: "🇨🇭",
      name: "Switzerland",
      region: "Europe",
      subregion: "Western Europe",
    },
    {
      cca2: "DE",
      currency: "EUR",
      callingCode: "49",
      flag: "🇩🇪",
      name: "Germany",
      region: "Europe",
      subregion: "Western Europe",
    },
    {
      cca2: "FR",
      currency: "EUR",
      callingCode: "33",
      flag: "🇫🇷",
      name: "France",
      region: "Europe",
      subregion: "Western Europe",
    },
    {
      cca2: "IT",
      currency: "EUR",
      callingCode: "39",
      flag: "🇮🇹",
      name: "Italy",
      region: "Europe",
      subregion: "Southern Europe",
    },
    {
      cca2: "ES",
      currency: "EUR",
      callingCode: "34",
      flag: "🇪🇸",
      name: "Spain",
      region: "Europe",
      subregion: "Southern Europe",
    },
    {
      cca2: "NL",
      currency: "EUR",
      callingCode: "31",
      flag: "🇳🇱",
      name: "Netherlands",
      region: "Europe",
      subregion: "Western Europe",
    },
    {
      cca2: "BE",
      currency: "EUR",
      callingCode: "32",
      flag: "🇧🇪",
      name: "Belgium",
      region: "Europe",
      subregion: "Western Europe",
    },
    {
      cca2: "AT",
      currency: "EUR",
      callingCode: "43",
      flag: "🇦🇹",
      name: "Austria",
      region: "Europe",
      subregion: "Western Europe",
    },
    {
      cca2: "GR",
      currency: "EUR",
      callingCode: "30",
      flag: "🇬🇷",
      name: "Greece",
      region: "Europe",
      subregion: "Southern Europe",
    },
    {
      cca2: "PT",
      currency: "EUR",
      callingCode: "351",
      flag: "🇵🇹",
      name: "Portugal",
      region: "Europe",
      subregion: "Southern Europe",
    },
    {
      cca2: "SE",
      currency: "SEK",
      callingCode: "46",
      flag: "🇸🇪",
      name: "Sweden",
      region: "Europe",
      subregion: "Northern Europe",
    },
    {
      cca2: "NO",
      currency: "NOK",
      callingCode: "47",
      flag: "🇳🇴",
      name: "Norway",
      region: "Europe",
      subregion: "Northern Europe",
    },
    {
      cca2: "DK",
      currency: "DKK",
      callingCode: "45",
      flag: "🇩🇰",
      name: "Denmark",
      region: "Europe",
      subregion: "Northern Europe",
    },
    {
      cca2: "FI",
      currency: "EUR",
      callingCode: "358",
      flag: "🇫🇮",
      name: "Finland",
      region: "Europe",
      subregion: "Northern Europe",
    },
    {
      cca2: "IE",
      currency: "EUR",
      callingCode: "353",
      flag: "🇮🇪",
      name: "Ireland",
      region: "Europe",
      subregion: "Northern Europe",
    },
    {
      cca2: "GB",
      currency: "GBP",
      callingCode: "44",
      flag: "🇬🇧",
      name: "United Kingdom",
      region: "Europe",
      subregion: "Northern Europe",
    },
    {
      cca2: "CZ",
      currency: "CZK",
      callingCode: "420",
      flag: "🇨🇿",
      name: "Czech Republic",
      region: "Europe",
      subregion: "Central Europe",
    },
    {
      cca2: "PL",
      currency: "PLN",
      callingCode: "48",
      flag: "🇵🇱",
      name: "Poland",
      region: "Europe",
      subregion: "Central Europe",
    },
    {
      cca2: "HU",
      currency: "HUF",
      callingCode: "36",
      flag: "🇭🇺",
      name: "Hungary",
      region: "Europe",
      subregion: "Central Europe",
    },
    {
      cca2: "RO",
      currency: "RON",
      callingCode: "40",
      flag: "🇷🇴",
      name: "Romania",
      region: "Europe",
      subregion: "Eastern Europe",
    },
  ];

  // Select a random country from the list
  return faker.helpers.arrayElement(europeanCountries);
};

// Function to generate random user images from the Random User API based on gender
export const fetchRandomImage = async (gender: string) => {
  try {
    // The gender parameter should be "male" or "female" for the Random User API
    const apiGender = gender === "MAN" ? "male" : "female";
    const response = await axios.get(
      `https://randomuser.me/api/?gender=${apiGender}`
    );
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
export const generateRandomUser = async () => {
  // Randomly select the gender for the user
  const gender = faker.helpers.arrayElement(QUESTIONS.gender);

  // Fetch images based on the user's gender
  const profilePicture = await fetchRandomImage(gender);
  const images = [
    await fetchRandomImage(gender),
    await fetchRandomImage(gender),
  ];

  // Hash the password using bcrypt
  const plainPassword = "1234"; // The plain password
  const saltRounds = 10; // Number of salt rounds for bcrypt
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

  return {
    role: "USER",
    profilePicture,
    images,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    username: faker.internet.userName(),
    email: faker.internet.email().toLowerCase(),
    emailVerified: faker.datatype.boolean(),
    isProfileCompleted: faker.datatype.boolean(),
    profilePrivacy: faker.datatype.boolean(),
    password: hashedPassword, // Use the hashed password
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
    gender, // Use the randomly selected gender
    interestedGender: faker.helpers.arrayElement(QUESTIONS.interestedGender),
    age: faker.number.int({ min: QUESTIONS.age.min, max: QUESTIONS.age.max }),
    countryOfOrigin: generateRandomCountry(), // Use the Country object format
    currentLocation: {
      city: faker.address.city(),
      region: faker.address.state(),
      country: faker.address.country(),
      postalCode: faker.address.zipCode(),
      latitude: faker.address.latitude(),
      longitude: faker.address.longitude(),
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
    longTermCountries: [generateRandomCountry(), generateRandomCountry()], // Array of Country objects
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
