const mongoose = require("mongoose");
require("dotenv").config();

// DATABASE CONNECTION
// const dbConnect = () => {
//   mongoose
//     .connect(process.env.DATABASE_URL as string, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//     .then(() => console.log("Database connected 🔥 !!"))
//     .catch((err: any) => console.log(err));
// };
const dbConnect = () => {
  mongoose
    .connect(
      "mongodb+srv://sluicameroon:OAtWNnd9SEtbmhK2@stlouis.i1jaixp.mongodb.net/",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .then(() => console.log("Database connected 🔥 !!"))
    .catch((err: any) => console.log(err));
};

export default dbConnect;
