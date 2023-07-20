#! /usr/bin/env node

console.log(
  "This script populates some test books, authors, genres and bookinstances to your database."
);

require("dotenv").config();

const Item = require("./models/item");
const Category = require("./models/category");

const items = [];
const categories = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false); // Prepare for Mongoose 7

const mongoDB = process.env.MONGO_URI;
console.log(`Uploading on mongo: ${mongoDB}...`);

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createCategories();
  await createItems();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

async function categoryCreate(index, name, description) {
  const category = new Category({ name: name, description: description });
  await category.save();
  categories[index] = category;
  console.log(`Added category: ${name}`);
}

async function createCategories() {
  console.log("Adding categories");
  await Promise.all([
    categoryCreate(0, "TKL", "No numpad"),
    categoryCreate(1, "75%", "One block"),
    categoryCreate(2, "65%", "No F keys"),
  ]);
}

async function itemCreate(
  index,
  title,
  description,
  price,
  numberInStock,
  category
) {
  const itemDetail = {
    title: title,
    description: description,
    price: price,
    numberInStock: numberInStock,
    category: category,
  };

  const item = new Item(itemDetail);
  await item.save();
  items[index] = item;
  console.log(`Added item: ${title}`);
}

async function createItems() {
  console.log("Adding Items");
  await Promise.all([
    itemCreate(
      0,
      "Lion TKL",
      "Ready to use hot-swap keyboard with pbt keycaps",
      235,
      4,
      categories[0]
    ),
    itemCreate(
      1,
      "Odin 75",
      "Pre-assembled aluminium keyboard",
      434,
      27,
      categories[1]
    ),
    itemCreate(2, "KBD75", "Awesome keyboard", 100, 7, categories[1]),
    itemCreate(3, "KBD68", "Small keyboard", 300, 2, categories[2]),
    itemCreate(4, "KBD68 lite", "Budget keyboard", 70, 450, categories[2]),
  ]);
}
