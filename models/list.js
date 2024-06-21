const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image:{
        url: String,
        filename: String,
    },
    
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],

    Owner: {
         type: Schema.Types.ObjectId,
         ref: "User",
    },

    category: {
        type: String,
        enum: ["Rooms", "Farms", "Cabins", "Office", "Caves", "TreeHouses", "House", "Industry", "Centers"],
    },
});

const Listing = mongoose.model("Listing", listSchema);
module.exports = Listing;