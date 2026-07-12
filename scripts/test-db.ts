import { MongoClient } from "mongodb";

const uri = "mongodb+srv://skillBridge:LOOKM7SXRQvnDXIw@mahadin.w5bth9k.mongodb.net/?appName=Mahadin";
console.log("Connecting to MongoDB...");
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000,
});

async function run() {
  try {
    await client.connect();
    console.log("Connected successfully!");
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    if (collections.some(c => c.name === "user")) {
      const users = await db.collection("user").find({}).toArray();
      console.log("Users in DB:", users);
    }
    
    if (collections.some(c => c.name === "account")) {
      const accounts = await db.collection("account").find({}).toArray();
      console.log("Accounts in DB:", accounts);
    }
    
    if (collections.some(c => c.name === "session")) {
      const sessions = await db.collection("session").find({}).toArray();
      console.log("Sessions in DB:", sessions);
    }
  } catch (err: any) {
    console.error("Connection failed:", err.message);
  } finally {
    await client.close();
  }
}

run();
