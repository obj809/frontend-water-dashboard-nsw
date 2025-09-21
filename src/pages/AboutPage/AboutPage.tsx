// src/pages/AboutPage/AboutPage.tsx

import React from 'react';
import './AboutPage.scss';
import Footer from '../../components/Footer/Footer';

const AboutPage: React.FC = () => {
  return (
    <div className="AboutPage" aria-label="About Page">
      <main className="AboutPage__main">
        <section className="about-stage">
          <div className="about-canvas">
            <h2 className="about-title">About This Project</h2>
            <p>
              🌊 Dams have long been vital for water security, power generation, and flood
              control. In New South Wales, WaterNSW manages key dams that supply millions of
              people across Greater Sydney.
            </p>
            <p>
              🌐 This project is a data dashboard that visualises live and historical dam
              information from the WaterNSW API. It combines a Flask backend, a React
              frontend, and AWS pipelines for data processing and storage.
            </p>
            <p>
              🌱 By making this data accessible, the project helps raise awareness of water
              resources and supports sustainable water management.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
