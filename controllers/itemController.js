const Item = require("../models/item");
const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
  // Get details of Items, Item instances, authors and genre counts (in parallel)
  const [numItems, numCategories] = await Promise.all([
    Item.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Inventory Home",
    item_count: numItems,
    category_count: numCategories,
  });
});
// Display list of all items.
exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({}, "title category")
    .sort({ title: 1 })
    .populate("category")
    .exec();

  res.render("item_list", { title: "Item List", item_list: allItems });
});

// Display detail page for a specific item.
exports.item_detail = asyncHandler(async (req, res, next) => {
  // Get details of items
  const item = await Item.findById(req.params.id).populate("category").exec();

  if (item === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("item_detail", {
    item: item,
  });
});

// Display item create form on GET.
exports.item_create_get = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find({}, "name").exec();

  res.render("item_form", {
    title: "Create Item",
    category_list: allCategories,
  });
});

// Handle Author create on POST.
exports.item_create_post = [
  // Validate and sanitize fields.
  body("title")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Title field is required"),
  body("category", "Category must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description field is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price field is required and must be a number greater than 0")
    .trim()
    .isInt({ min: 1 })
    .escape(),
  body(
    "numberInStock",
    "Number in stock field is required and must be a whole number greater than 0"
  )
    .trim()
    .isInt({ min: 1 })
    .escape(),
  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Author object with escaped and trimmed data
    const item = new Item({
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      price: req.body.price,
      numberInStock: req.body.numberInStock,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      const allCategories = await Category.find({}, "name").exec();

      res.render("item_form", {
        title: "Create Item",
        category_list: allCategories,
        selected_category: item.category._id,
        item: item,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Save author.
      await item.save();
      // Redirect to new author record.
      res.redirect(item.url);
    }
  }),
];

// Display item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    // No results.
    res.redirect("/catalog/items");
  }

  res.render("item_delete", {
    title: "Delete Item",
    item: item,
  });
});

// Handle item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of category and all their items (in parallel)
  const item = await Item.findById(req.params.id).exec();
  if (item !== null) {
    await Item.findByIdAndRemove(req.body.item_id);
  }

  res.redirect("/catalog/items");
});

// Display item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
  // Get book, authors and genres for form.
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).populate("category").exec(),
    Category.find().exec(),
  ]);

  if (item === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("item_form", {
    title: "Update Item",
    category_list: allCategories,
    selected_category: item.category._id,
    item: item,
  });
});

// Handle item update on POST.
exports.item_update_post = [
  body("title")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Title field is required"),
  body("category", "Category must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description field is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price field is required and must be a number greater than 0")
    .trim()
    .isInt({ min: 1 })
    .escape(),
  body(
    "numberInStock",
    "Number in stock field is required and must be a whole number greater than 0"
  )
    .trim()
    .isInt({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    const item = new Item({
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      price: req.body.price,
      numberInStock: req.body.numberInStock,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form
      const allCategories = await Category.find().exec();

      res.render("item_form", {
        title: "Update Book",
        category_list: allCategories,
        selected_category: item.category,
        item: item,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const theItem = await Item.findByIdAndUpdate(req.params.id, item, {});
      // Redirect to book detail page.
      res.redirect(theItem.url);
    }
  }),
];
