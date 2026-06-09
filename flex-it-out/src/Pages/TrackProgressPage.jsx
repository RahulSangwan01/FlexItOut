import React from "react";
import { motion } from "framer-motion";
import "./TrackProgressPage.css"; // Ensure this CSS file handles styling

const trainers = [
  {
    id: 1,
    name: "Ronnie Coleman",
    expertise: "Strength Training",
    photo: "https://rukminim2.flixcart.com/image/850/1000/l1tmf0w0/poster/0/a/d/small-poster-ronnie-coleman-body-building-ser-1-wall-poster-300-original-imagdazfkcfjqv6d.jpeg?q=20&crop=false", // Replace with actual image path
    exercises: ["Squats", "Deadlifts", "Bench Press"],
    plans: ["Beginner Strength Plan", "Intermediate Powerlifting Plan"],
  },
  {
    id: 2,
    name: "Kathryn Budig",
    expertise: "Yoga & Flexibility",
    photo: "https://www.starkphotography.com/wp-content/uploads/2016/03/kathryn_budig_yoga_santorini_greece016-2000x1333.jpg", // Replace with actual image path
    exercises: ["Sun Salutation", "Tree Pose", "Downward Dog"],
    plans: ["Beginner Yoga Plan", "Advanced Flexibility Plan"],
  },
  {
    id: 3,
    name: "Hannah Eden",
    expertise: "HIIT & Cardio",
    photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSY2XcyfajBHCjce5wIwaH2h-Xfu9-xdsTvAA&s",
    exercises: ["Jump Rope", "Burpees", "Mountain Climbers"],
    plans: ["Fat Burn HIIT", "Endurance Training"],
  },
  {
    id: 4,
    name: "Arnold Schwarzenegger",
    expertise: "Pilates & Core Strength",
    photo: "https://media.newyorker.com/photos/624f484bb8900d61c847f8d7/master/pass/Long-Butler-09.jpg",
    exercises: ["Plank Variations", "Leg Raises", "Russian Twists"],
    plans: ["Core Strength Plan", "Pilates for Beginners"],
  },
  {
    id: 5,
    name: "Bruce Lee",
    expertise: "Martial Arts & Kickboxing",
    photo: "https://i.pinimg.com/736x/ba/a6/47/baa647bfe1f4c950160d1e611a2e40d6.jpg",
    exercises: ["Roundhouse Kick", "Jab-Cross Combo", "Muay Thai Clinch"],
    plans: ["Kickboxing Fundamentals", "Advanced Martial Arts"],
  },
  {
    id: 6,
    name: "Jay Cutler",
    expertise: "Bodybuilding & Hypertrophy",
    photo: "https://w0.peakpx.com/wallpaper/33/10/HD-wallpaper-jay-cutler-jay-cutler-bodybuilder-fitness-body-builder-monochrome-black-and-white.jpg",
    exercises: ["Bicep Curls", "Leg Press", "Lat Pulldown"],
    plans: ["Muscle Gain Plan", "Bodybuilding Pro Program"],
  },
  {
    id: 6,
    name: "Usain Bolt",
    expertise: "Athletics",
    photo: "https://i.tribune.com.pk/media/images/708982-UsainBoltAFP-1400187021/708982-UsainBoltAFP-1400187021.jpg",
    exercises: ["Sprinting", "Explosive Power", "Agility"],
    plans: ["Muscle Gain Plan", "Bodybuilding Pro Program"],
  },
  {
    id: 6,
    name: "Simone Biles",
    expertise: "Gymnastics",
    photo: "https://simonebiles.com/wp-content/uploads/2021/08/simone-biles-bw.jpg",
    exercises: ["Precision", "Flexibility", "Strength"],
    plans: ["Muscle Gain Plan", "Bodybuilding Pro Program"],
  },
];

const TrackProgressPage = () => {
  return (
    <div className="trainer-progress-container">
      <motion.h1 
        initial={{ y: -20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 0.5 }}
      >
        Meet Our Expert Trainers
      </motion.h1>

      <div className="trainer-list">
        {trainers.map((trainer) => (
          <motion.div 
            key={trainer.id} 
            className="trainer-card" 
            whileHover={{ scale: 1.05 }}
          >
            <img src={trainer.photo} alt={trainer.name} className="trainer-photo" />
            <h2>{trainer.name}</h2>
            <p>{trainer.expertise}</p>
            <h3>Exercises:</h3>
            <ul>
              {trainer.exercises.map((exercise, index) => (
                <li key={index}>{exercise}</li>
              ))}
            </ul>
            {/* <h3>Plans:</h3>
            <ul>
              {trainer.plans.map((plan, index) => (
                <li key={index}>{plan}</li>
              ))}
            </ul> */}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TrackProgressPage;
