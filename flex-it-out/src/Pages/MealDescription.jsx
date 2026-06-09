import React from "react";
import { useLocation } from "react-router-dom";
import "./MealDescription.css";

const MealDescription = () => {
  const location = useLocation();
  const meal = location.state?.meal; 

  if (!meal) return <p className="error">No meal details found!</p>;

  return (
    <div className="meal-details">
      <img src={meal.imageUrl} alt={meal.name} className="meal-img" />
      <h1 className="meal-title">{meal.name}</h1>
      <p className="meal-calories">Calories: {meal.calories} kcal</p>
      <p className="meal-description">{meal.description}</p>
      <h3 className="ingredients-title">Ingredients:</h3>
        <ul className="ingredients-list">
            {meal.ingredients.map((ingredient, index) => (
                <li key={ingredient._id}>
                {ingredient.name} - {ingredient.quantity}
                </li>
            ))}
        </ul>
    </div>
  );
};

export default MealDescription;
