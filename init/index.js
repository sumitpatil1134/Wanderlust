 const mongoose=require("mongoose");

 const initData=require("./data.js");
 const Listing=require("../models/listing.js");
 const MANGO_URI = 'mongodb://localhost:27017/wanderlust';
 
 main()
     .then(() => {console.log('Connected to MongoDB');
    })
     .catch(err =>{
         console.log("Error connecting to MongoDB:", err);
     });
 
 async function main() {
     await mongoose.connect(MANGO_URI);
 }

 const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({
        ...obj,
        owner: new mongoose.Types.ObjectId("69b14e7b87d70f947d81b444")
    }));
    await Listing.insertMany(initData.data);
    console.log("data was initalize");

 };

 initDB();
 