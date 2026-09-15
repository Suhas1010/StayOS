import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/db.js";

import User from "./src/models/user.models.js";
import Property from "./src/models/property.models.js";
import Room from "./src/models/room.models.js";
import Tenant from "./src/models/tenant.models.js";
import Rent from "./src/models/rent.models.js";
import Complaint from "./src/models/complaint.models.js";

await connectDB();

const tenants = await Tenant.find().limit(5);
console.log("\nTENANTS");
console.log(tenants);
console.log("\nUSER");
console.log(await User.collection.getIndexes());

console.log("\nPROPERTY");
console.log(await Property.collection.getIndexes());

console.log("\nROOM");
console.log(await Room.collection.getIndexes());

console.log("\nTENANT");
console.log(await Tenant.collection.getIndexes());

console.log("\nRENT");
console.log(await Rent.collection.getIndexes());

console.log("\nCOMPLAINT");
console.log(await Complaint.collection.getIndexes());

process.exit(0);