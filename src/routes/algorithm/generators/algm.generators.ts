import axios from "axios";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";
import { QUESTIONS } from "../algm.data"; // Import the QUESTIONS data

// Define the Country object structure
interface Country {
  cca2: string;
  currency: string;
  callingCode: string;
  flag: string;
  name: string;
  region: string;
  subregion: string;
  latitude: number;
  longitude: number;
}

// Distribution map for user generation
export const countryDistribution = {
  France: 250,
  Belgium: 125,
  Canada: 125,
  Switzerland: 100,
  Germany: 100,
  UK: 50,
  Italy: 75,
  Portugal: 25,
  Spain: 25,
  Netherlands: 25,
  "Rest of Europe": 100,
};

// Country data with real latitude and longitude
export const countryData: { [key: string]: Country } = {
  France: {
    cca2: "FR",
    currency: "EUR",
    callingCode: "33",
    flag: "🇫🇷",
    name: "France",
    region: "Europe",
    subregion: "Western Europe",
    latitude: 46.603354,
    longitude: 1.888334,
  },
  Belgium: {
    cca2: "BE",
    currency: "EUR",
    callingCode: "32",
    flag: "🇧🇪",
    name: "Belgium",
    region: "Europe",
    subregion: "Western Europe",
    latitude: 50.503887,
    longitude: 4.469936,
  },
  Canada: {
    cca2: "CA",
    currency: "CAD",
    callingCode: "1",
    flag: "🇨🇦",
    name: "Canada",
    region: "Americas",
    subregion: "Northern America",
    latitude: 56.130366,
    longitude: -106.346771,
  },
  Switzerland: {
    cca2: "CH",
    currency: "CHF",
    callingCode: "41",
    flag: "🇨🇭",
    name: "Switzerland",
    region: "Europe",
    subregion: "Western Europe",
    latitude: 46.818188,
    longitude: 8.227512,
  },
  Germany: {
    cca2: "DE",
    currency: "EUR",
    callingCode: "49",
    flag: "🇩🇪",
    name: "Germany",
    region: "Europe",
    subregion: "Western Europe",
    latitude: 51.165691,
    longitude: 10.451526,
  },
  UK: {
    cca2: "GB",
    currency: "GBP",
    callingCode: "44",
    flag: "🇬🇧",
    name: "United Kingdom",
    region: "Europe",
    subregion: "Northern Europe",
    latitude: 55.378051,
    longitude: -3.435973,
  },
  Italy: {
    cca2: "IT",
    currency: "EUR",
    callingCode: "39",
    flag: "🇮🇹",
    name: "Italy",
    region: "Europe",
    subregion: "Southern Europe",
    latitude: 41.87194,
    longitude: 12.56738,
  },
  Portugal: {
    cca2: "PT",
    currency: "EUR",
    callingCode: "351",
    flag: "🇵🇹",
    name: "Portugal",
    region: "Europe",
    subregion: "Southern Europe",
    latitude: 39.399872,
    longitude: -8.224454,
  },
  Spain: {
    cca2: "ES",
    currency: "EUR",
    callingCode: "34",
    flag: "🇪🇸",
    name: "Spain",
    region: "Europe",
    subregion: "Southern Europe",
    latitude: 40.463667,
    longitude: -3.74922,
  },
  Netherlands: {
    cca2: "NL",
    currency: "EUR",
    callingCode: "31",
    flag: "🇳🇱",
    name: "Netherlands",
    region: "Europe",
    subregion: "Western Europe",
    latitude: 52.132633,
    longitude: 5.291266,
  },
};

// Function to generate a random location within a given range around central coordinates
const generateRandomLocation = (latitude: number, longitude: number) => {
  const randomOffset = () => (Math.random() - 0.5) * 0.5; // Offset of up to ±0.25 degrees
  return {
    latitude: latitude + randomOffset(),
    longitude: longitude + randomOffset(),
  };
};

// Function to fetch random user images from the Random User API based on gender
export const fetchRandomImage = async (gender: string) => {
  try {
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
const generateRandomUser = async (country: Country) => {
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
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

  // Generate a random location within the country
  const { latitude, longitude } = generateRandomLocation(
    country.latitude,
    country.longitude
  );

  return {
    role: "USER",
    profilePicture,
    images,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    username: faker.internet.userName(),
    email: faker.internet.email().toLowerCase(),
    emailVerified: true,
    isProfileCompleted: true,
    profilePrivacy: faker.datatype.boolean(),
    password: hashedPassword,
    questionOne: faker.helpers.arrayElement(QUESTIONS.optionQuestions),
    answerOne: faker.lorem.sentence(),
    questionTwo: faker.helpers.arrayElement(QUESTIONS.optionQuestions),
    answerTwo: faker.lorem.sentence(),
    bio: faker.lorem.paragraph(),
    location: country.name,
    likedUsers: [],
    premium: {
      isPremium: faker.datatype.boolean(),
      plan: faker.helpers.arrayElement(["FREE", "BASIC", "PREMIUM"]),
      expiresIn: faker.date.future(),
    },
    gender,
    interestedGender: faker.helpers.arrayElement(QUESTIONS.interestedGender),
    age: faker.number.int({ min: QUESTIONS.age.min, max: QUESTIONS.age.max }),
    countryOfOrigin: country,
    currentLocation: {
      city: faker.address.city(),
      region: faker.address.state(),
      country: country.name,
      postalCode: faker.address.zipCode(),
      latitude,
      longitude,
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
    longTermCountries: [country, country], // Example of long-term countries
    partnerAge: {
      minValue: faker.number.int({
        min: QUESTIONS.partnerHeight.min,
        max: 170,
      }),
      maxValue: faker.number.int({
        min: 171,
        max: QUESTIONS.partnerHeight.max,
      }),
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
  };
};

export { generateRandomUser };
