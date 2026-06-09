const mongoose = require("mongoose");
const Meal = require("./models/Meal");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const meals = [
  {
    name: "Oatmeal with Fruits",
    description: "1. Boil oats in water/milk. 2. Add chopped fruits. 3. Stir well and serve.",
    ingredients: [
      { name: "Oats", quantity: "1 cup" },
      { name: "Milk", quantity: "1 cup" },
      { name: "Banana", quantity: "1 sliced" },
      { name: "Almonds", quantity: "5-6 chopped" }
    ],
    calories: 300,
    category: "Breakfast",
    imageUrl: "https://www.acouplecooks.com/wp-content/uploads/2023/08/How-to-make-oatmeal-005.jpg",
  },
  {
    name: "Veg Paneer Salad",
    description: "1. Chop paneer and vegetables. 2. Toss with dressing. 3. Serve fresh.",
    ingredients: [
      { name: "Paneer", quantity: "100g" },
      { name: "Cucumber", quantity: "1 chopped" },
      { name: "Tomato", quantity: "1 chopped" },
      { name: "Olive Oil", quantity: "1 tbsp" },
    ],
    calories: 350,
    category: "Lunch",
    imageUrl: "https://greenbowl2soul.com/wp-content/uploads/2023/03/Paneer-salad.jpg",
  },
  {
    name: "Protein Shake",
    description: "1. Blend banana, protein powder, and milk. 2. Serve chilled.",
    ingredients: [
      { name: "Banana", quantity: "1 whole" },
      { name: "Milk", quantity: "1 cup" },
      { name: "Protein Powder", quantity: "1 scoop" },
      { name: "Peanut Butter", quantity: "1 tbsp" },
    ],
    calories: 450,
    category: "Snack",
    imageUrl: "https://fitfoodiefinds.com/wp-content/uploads/2020/01/sq.jpg",
  },
  {
    name: "Avocado Sandwich",
    description: "1. Toast bread. 2. Mash avocado with lemon juice. 3. Spread on bread and serve.",
    ingredients: [
      { name: "Whole Wheat Bread", quantity: "2 slices" },
      { name: "Avocado", quantity: "1 mashed" },
      { name: "Lemon Juice", quantity: "1 tsp" },
      { name: "Black Pepper", quantity: "to taste" },
    ],
    calories: 380,
    category: "Breakfast",
    imageUrl: "https://static.toiimg.com/thumb/63842321.cms?imgsize=524668&width=800&height=800",
  },
  {
    name: "Greek Yogurt Parfait",
    description: "1. Layer yogurt, granola, and fruits. 2. Repeat layers and serve.",
    ingredients: [
      { name: "Greek Yogurt", quantity: "1 cup" },
      { name: "Granola", quantity: "1/2 cup" },
      { name: "Mixed Berries", quantity: "1/2 cup" },
      { name: "Honey", quantity: "1 tsp" },
    ],
    calories: 320,
    category: "Breakfast",
    imageUrl: "https://foolproofliving.com/wp-content/uploads/2017/12/Greek-Yogurt-Parfait-Recipe.jpg",
  },
  {
    name: "Quinoa & Chickpea Salad",
    description: "1. Cook quinoa. 2. Mix with chickpeas, veggies, and dressing. 3. Serve.",
    ingredients: [
      { name: "Quinoa", quantity: "1 cup" },
      { name: "Chickpeas", quantity: "1/2 cup" },
      { name: "Red Bell Pepper", quantity: "1 chopped" },
      { name: "Lemon Juice", quantity: "1 tbsp" },
    ],
    calories: 420,
    category: "Lunch",
    imageUrl: "https://elavegan.com/wp-content/uploads/2022/02/pouring-lemon-vinaigrette-over-quinoa-salad.jpg",
  },
  {
    name: "Mango Smoothie Bowl",
    description: "1. Blend mango and yogurt. 2. Pour into a bowl. 3. Top with fruits and nuts.",
    ingredients: [
      { name: "Mango", quantity: "1 whole" },
      { name: "Greek Yogurt", quantity: "1 cup" },
      { name: "Almonds", quantity: "5-6 chopped" },
      { name: "Chia Seeds", quantity: "1 tsp" },
    ],
    calories: 350,
    category: "Snack",
    imageUrl: "https://i2.wp.com/www.downshiftology.com/wp-content/uploads/2015/06/mango-smoothie-bowl-1.jpg",
  },
  {
    name: "Lentil Soup",
    description: "1. Cook lentils with spices. 2. Simmer until soft. 3. Serve hot.",
    ingredients: [
      { name: "Lentils", quantity: "1 cup" },
      { name: "Tomato", quantity: "1 chopped" },
      { name: "Garlic", quantity: "2 cloves minced" },
      { name: "Cumin", quantity: "1 tsp" },
    ],
    calories: 390,
    category: "Dinner",
    imageUrl: "https://www.livinglou.com/wp-content/uploads/2020/04/mediterranean-lentil-soup.jpg",
  },
  {
    name: "Stir-Fried Tofu & Vegetables",
    description: "1. Stir-fry tofu and vegetables. 2. Add soy sauce. 3. Serve with rice.",
    ingredients: [
      { name: "Tofu", quantity: "100g" },
      { name: "Broccoli", quantity: "1/2 cup" },
      { name: "Carrot", quantity: "1 sliced" },
      { name: "Soy Sauce", quantity: "1 tbsp" },
    ],
    calories: 400,
    category: "Dinner",
    imageUrl: "https://www.joeshealthymeals.com/wp-content/uploads/2017/06/Veggie-stir-fry.jpg",
  },
];

const seedDB = async () => {
  try {
    await Meal.deleteMany();
    await Meal.insertMany(meals);
    console.log("Meals seeded successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding error:", error);
    mongoose.connection.close();
  }
};

seedDB();