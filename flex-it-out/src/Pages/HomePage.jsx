import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FaDumbbell, FaAppleAlt, FaUserFriends, FaMedal, FaArrowRight } from "react-icons/fa"
import axios from "axios"
import './HomePage.css'

const HomePage = () => {
  const navigate = useNavigate()


  const nutritionPage = () => {
    navigate("/nutrition")
  }

  const goToCommunity = () => {
    navigate('/community')
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      {/* <motion.div className="hero-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <section className="hero">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            CRUSH WORKOUTS, ANYTIME, ANYWHERE.
          </motion.h1>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Train like a beast, transform like a legend!
          </motion.p>
          <motion.button
            className="cta-button"
            onClick={() => navigate("/workout")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started <FaArrowRight className="cta-icon" />
          </motion.button>
        </section>
      </motion.div> */}




<motion.div className="hero-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
  {/* Background Video */}
  <video autoPlay loop muted playsInline className="video-bg">
    <source src="/flexitoutvideo.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>

  {/* Content Over Video */}
  <section className="hero">
    <motion.h1
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.8 }}
    >
      CRUSH WORKOUTS, ANYTIME, ANYWHERE.
    </motion.h1>
    <motion.p
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.8 }}
    >
      Train like a beast, transform like a legend!
    </motion.p>
    <motion.button
      className="cta-button"
      onClick={() => navigate("/workout")}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Get Started <FaArrowRight className="cta-icon" />
    </motion.button>
  </section>
</motion.div>



{/* Testimonials Section */}
<section className="testimonials">
          <h2 >Empowered Voices: Member Experiences</h2>
          <div className="testimonial-carousel">
            <div className="testimonial">
              <p>"This app didn't just change my fitness—it changed my life. Every workout feels like a step toward greatness!"</p>
              <span>- Sarah J.</span>
            </div>
            <div className="testimonial">
              <p>"The personalized plans are more than workouts—they’re a blueprint for success. I’ve never felt this unstoppable!"</p>
              <span>- Mike R.</span>
            </div>
          </div>
        </section>





      <div className="content-wrapper">
        <section className="features">
          <motion.div className="feature-card" whileHover={{ scale: 1.05 }}>
            <FaDumbbell className="feature-icon" />
            <h3>Personalized Training</h3>
            <p>Work with expert trainers and get customized workouts.</p>
            <button className="feature-button" onClick={() => navigate("/track-progress")}>
            Learn More
            </button>
          </motion.div>
          <motion.div className="feature-card" whileHover={{ scale: 1.05 }}>
            <FaUserFriends className="feature-icon" />
            <h3>Community Support</h3>
            <p>Find your fitness squad and stay motivated together!</p>
            <button className="feature-button" onClick={goToCommunity}>Join Now</button>
          </motion.div>
          <motion.div className="feature-card" whileHover={{ scale: 1.05 }} onClick={nutritionPage}>
            <FaAppleAlt className="feature-icon" />
            <h3>Nutrition Guidance</h3>
            <p>Get diet plans that suit your fitness journey.</p>
            <button className="feature-button">Explore</button>
          </motion.div>

          <motion.div className="feature-card" whileHover={{ scale: 1.05 }}>
            <FaMedal className="feature-icon" />
            <h3>Performmance overview</h3>
            <p>Monitor your achievements and celebrate milestones.</p>
            <button className="feature-button">View Progress</button>
          </motion.div>
        </section>

        

        {/* Call to Action Section */}
        <section className="cta">
          <h2>Ready to Transform Your Fitness Journey?</h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="cta-subtext"
          >
            Join thousands of members achieving their goals with our premium plans.
          </motion.p>
          <motion.button
            onClick={() => (window.location.href = "/pricing")}
            className="cta-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            Explore Premium Plans <FaArrowRight className="cta-icon" />
          </motion.button>
        </section>
      </div>
    </div>
  )
}

export default HomePage
