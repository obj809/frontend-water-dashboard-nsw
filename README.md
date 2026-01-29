# Water Dashboard NSW Frontend

![Tests](https://github.com/obj809/frontend-water-dashboard-nsw/actions/workflows/test.yml/badge.svg?branch=main)

## Project Overview
A modern data visualization dashboard displaying live and historical water dam information for New South Wales, Australia. Built with React, TypeScript, Redux Toolkit, and multiple charting libraries to provide real-time insights into dam storage levels, water inflows, and releases.


## Screenshot
<img src="./screen-recording.gif" alt="App Demo" width="960"/>

## Table of Contents
- [Goals & MVP](#goals--mvp)
- [Tech Stack](#tech-stack)
- [How To Use](#how-to-use)
- [Design Goals](#design-goals)
- [Project Features](#project-features)
- [Additions & Improvements](#additions--improvements)
- [Learning Highlights](#learning-highlights)
- [Known Issues](#known-issues)
- [Challenges](#challenges)


## Goals & MVP
The goal of this project is to create an accessible, interactive dashboard for visualizing NSW dam water data. By leveraging RTK Query for efficient API state management and multiple charting libraries, the application provides real-time insights into water resources while maintaining a responsive, user-friendly interface.

## Tech Stack
- React 18
- TypeScript
- Vite
- Redux Toolkit (RTK Query)
- React Router v6
- Recharts
- Chart.js
- D3.js
- SCSS
- Vitest + Testing Library

## How To Use
1. Ensure the backend API is running on `http://127.0.0.1:5001`.
2. Install dependencies with `npm install`.
3. Start the development server with `npm run dev`.
4. Navigate to `http://localhost:5173` to view the dashboard.

## Design Goals
- **Data-First Interface**: Prioritize clear, accurate visualization of complex water data.
- **Responsive Design**: Ensure optimal viewing experience across all device sizes.
- **Performance**: Leverage RTK Query caching for fast load times and minimal API calls.
- **Intuitive Navigation**: Implement smooth-scroll stacked pages for seamless browsing.

## Project Features
- [x] Advanced search functionality to filter dams by name
- [x] Interactive data visualizations using Recharts, Chart.js, and D3
- [x] Individual dam detail pages with comprehensive statistics
- [x] Comprehensive test suite with Vitest and Testing Library

## Additions & Improvements
- [ ] Integrate weather data to show rainfall correlations
- [ ] Add alert system for critical storage levels
- [ ] Add E2E testing with Playwright

## Learning Highlights
- Leveraging RTK Query for automatic caching, background refetching, and API state management
- Integrating multiple charting libraries (Recharts, Chart.js, D3) for different visualization needs
- Configuring Vite proxy for seamless backend communication during development
- Implementing comprehensive test coverage with Vitest and Testing Library

## Known Issues
- Some touch interactions on complex charts may require refinement on mobile
- Performance may degrade when rendering graphs with very large historical datasets

## Challenges
- Configuring Vite proxy to seamlessly communicate with Flask backend
- Evaluating and integrating multiple charting libraries for different use cases
- Maintaining TypeScript type safety with dynamic API responses

## Contact Me
- Visit my [LinkedIn](https://www.linkedin.com/in/obj809/) for more details.
- Check out my [GitHub](https://github.com/obj809) for more projects.
- Or send me an email at obj809@gmail.com

Thanks for your interest in this project. Feel free to reach out with any thoughts or questions.

Oliver Jenkins © 2025
