const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/list.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.connect(MONGO_URL);

}

const initDB = async () =>{
    await Listing.deleteMany({});
    //Data array mai sbhi data mai owner dene ke liye
    initData.data=initData.data.map((obj)=>({ ...obj, owner:"6544d081310387b5cdf6fc61"}));
    await Listing.insertMany(initData.data);
    console.log("Data was initialize");
};

initDB();