const express = require("express");
const ItemModel = require("../models/itemsModel");
const { Category } = require("../models/category")
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid image type');

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });


router.get("/", async (req, res) => {
  try {
    const items = await ItemModel.find({}).populate(
      'category',
      'name'
    );
    res.send(items);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get(`/:id`, async (req, res) => {
  const product = await ItemModel.findById(req.params.id).populate('category');

  if (!product) {
      res.status(500).json({ success: false });
  }
  res.send(product);
});

router.post("/", uploadOptions.single('image'), async (req, res) => {
  // const category = await Category.findById(req.body.category);
  // if (!category) return res.status(400).send('Invalid Category');

  // const file = req.file;
  // if (!file) return res.status(400).send('No image in the request');

  // const fileName = file.filename;
  // const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
  // let product = new ItemModel({
  //     name: req.body.name,
  //     image: `${basePath}${fileName}`, 
  //     price: req.body.price,
  //     category: req.body.category

  // });

  // product = await product.save();

  // if (!product) return res.status(500).send('The product cannot be created');

  // res.send(product);
  try {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let product = new ItemModel({
      name: req.body.name,
      image: `${basePath}${fileName}`,
      price: req.body.price,
      category: req.body.category

    });

    await product.save();
    res.send('Item added successfully')
  } catch (error) {
    res.status(400).json(error);
  }
});

// router.put("/:id", async (req, res) => {
//   try {
//     await ItemModel.findOneAndUpdate({ _id: req.body.itemId }, req.body)
//     res.send('Item updated successfully')
//   } catch (error) {
//     res.status(400).json(error);
//   }
// });
router.put('/:id', uploadOptions.single('image'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send('Invalid Product Id');
  }
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send('Invalid Category');

  const product = await ItemModel.findById(req.params.id);
  if (!product) return res.status(400).send('Invalid Product!');

  const file = req.file;
  let imagepath;

  if (file) {
      const fileName = file.filename;
      const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
      imagepath = `${basePath}${fileName}`;
  } else {
      imagepath = product.image;
  }

  const updatedProduct = await ItemModel.findByIdAndUpdate(
      req.params.id,
      {
          name: req.body.name,
        
          image: imagepath,
         
          price: req.body.price,
          category: req.body.category
         
      },
      { new: true }
  );

  if (!updatedProduct)
      return res.status(500).send('the product cannot be updated!');

  res.send(updatedProduct);
});


router.delete("/:id", async (req, res) => {
  try {
    const product = await ItemModel.findById(req.params.id);
    if (product) {
      await product.remove();
      res.json({ message: "Product removed" });
    }
  } catch (error) {
    res.status(400).json(error);
  }
});







module.exports = router
