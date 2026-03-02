import fs from "fs";
import path from "path";

/**
 * Restaurant login credentials
 * (Used for manual sharing with franchise owners)
 */
const restaurants = [
  {
    name: "Khammaghani Jaipur",
    email: "jaipur@khammaghani.com",
    password: "Khamma@Jaipur123",
    restaurantId: "JAIPUR_01",
  },
  {
    name: "Khammaghani Delhi",
    email: "delhi@khammaghani.com",
    password: "Khamma@Delhi123",
    restaurantId: "DELHI_01",
  },
  {
    name: "Khammaghani Mumbai",
    email: "mumbai@khammaghani.com",
    password: "Khamma@Mumbai123",
    restaurantId: "MUMBAI_01",
  },
  {
    name: "Khammaghani Udaipur",
    email: "udaipur@khammaghani.com",
    password: "Khamma@udaipur123",
    restaurantId: "UDAIPUR_01",
  },
  {
    name: "Khammaghani Jodhpur",
    email: "jodhpur@khammaghani.com",
    password: "Khamma@jodhpur123",
    restaurantId: "JODHPUR_01",
  },
  {
    name: "Khammaghani Goa",
    email: "goa@khammaghani.com",
    password: "Khamma@goa123",
    restaurantId: "GOA_01",
  },
  {
    name: "Khammaghani Bangalore",
    email: "bangalore@khammaghani.com",
    password: "Khamma@bangalore123",
    restaurantId: "BANGALORE_01",
  },
  {
    name: "Khammaghani Pune",
    email: "pune@khammaghani.com",
    password: "Khamma@pune123",
    restaurantId: "PUNE_01",
  },
  {
    name: "Khammaghani Noida",
    email: "noida@khammaghani.com",
    password: "Khamma@Noida123",
    restaurantId: "NOIDA_01",
  },
  {
    name: "Khammaghani Hyderabad",
    email: "hyderabad@khammaghani.com",
    password: "Khamma@Hyderabad123",
    restaurantId: "HYDERABAD_01",
  },
  {
    name: "Khammaghani Surat",
    email: "surat@khammaghani.com",
    password: "Khamma@Surat123",
    restaurantId: "SURAT_01",
  },
  {
    name: "Khammaghani Kashmir",
    email: "kashmir@khammaghani.com",
    password: "Khamma@Kashmir123",
    restaurantId: "KASHMIR_01",
  },
  {
    name: "Khammaghani Sikkim",
    email: "sikkim@khammaghani.com",
    password: "Khamma@Sikkim123",
    restaurantId: "SIKKIM_01",
  },
  {
    name: "Khammaghani Darjeeling",
    email: "darjeeling@khammaghani.com",
    password: "Khamma@Darjeeling123",
    restaurantId: "DARJEELING_01",
  },
  {
    name: "Khammaghani Bhopal",
    email: "bhopal@khammaghani.com",
    password: "Khamma@Bhopal123",
    restaurantId: "BHOPAL_01",
  },
];

// Output file path
const outputPath = path.join(process.cwd(), "restaurants-login.json");

// Write JSON file
fs.writeFileSync(outputPath, JSON.stringify(restaurants, null, 2));

console.log("✅ Restaurant login JSON created successfully!");
console.log(`📄 File location: ${outputPath}`);
