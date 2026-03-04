// src/pages/AboutPage/AboutPage.tsx

import React from 'react';
import './AboutPage.scss';
import Footer from '../../components/Footer/Footer';
import { useGetMetadataQuery } from '../../services/damsApi';

const AboutPage: React.FC = () => {
  const { data: metadata } = useGetMetadataQuery();

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="AboutPage" aria-label="About Page">
      <main className="AboutPage__main">
        <section className="about-stage">
          <div className="about-canvas">
            <h2 className="about-title">About This Project</h2>
            <p>
            🛈 This project is independently developed and is not affiliated with WaterNSW. 
            For authoritative, up-to-date information, refer to the official WaterNSW website and API.
            </p>
            <p>
              🌊 Dams have long been vital for water security, power generation, and flood
              control. In New South Wales, WaterNSW manages key dams that supply millions of
              people across Greater Sydney.
            </p>
            <p>
              🌐 This project is a data dashboard that visualises live and historical dam
              information from the WaterNSW API. It combines a Flask backend, a React
              frontend, and pipelines for data processing and storage.
            </p>
            <p>
              🌱 By making this data accessible, the project helps raise awareness of water
              resources and supports sustainable water management.
            </p>
          </div>
        </section>
      </main>

      {metadata?.latest_data_date && (
        <div className="about-page__data-date" aria-label="Latest Data Date">
          Last updated: {formatDate(metadata.latest_data_date)}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AboutPage;
