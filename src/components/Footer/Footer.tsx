// src/components/Footer/Footer.tsx

import React from 'react';
import './Footer.scss';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="Footer" role="contentinfo">
      <div className="Footer__inner">
        <div className="Footer__left">
          <p>© {currentYear} Water Dashboard NSW</p>
        </div>

        <nav className="Footer__right" aria-label="External links">
          <a
            href="https://api.nsw.gov.au/Product/Index/26"
            target="_blank"
            rel="noopener noreferrer"
          >
            NSW Open Data API
          </a>
          <a
            href="https://www.waternsw.com.au/"
            target="_blank"
            rel="noopener noreferrer"
          >
            WaterNSW
          </a>
          <a
            href="https://github.com/obj809/water-dashboard-nsw"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
