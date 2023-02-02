const mongoose = require("mongoose");

const itemsSchema = mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  image: { type: String, required: true },
}, { timestamps: true });

const itemsModel = mongoose.model("items", itemsSchema);

module.exports = itemsModel;
