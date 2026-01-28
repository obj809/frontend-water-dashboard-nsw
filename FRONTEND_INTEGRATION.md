# Frontend Integration Guide

This document provides context for building a React frontend that connects to the NSW Water Dashboard API.

## API Details

- **Production URL**: `https://backend-water-dashboard-nsw.onrender.com/api`
- **Local Development URL**: `http://localhost:5001/api`
- **Swagger Docs**: `https://backend-water-dashboard-nsw.onrender.com/api/docs`
- **CORS**: Allows all origins (*)

## Available Endpoints

### Dams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dams/` | List all dams |
| GET | `/dams/<dam_id>` | Get single dam details |

**Response shape** (`/dams/`):
```json
[
  {
    "dam_id": "203042",
    "dam_name": "Toonumbar Dam",
    "full_volume": 10814,
    "latitude": -28.602383,
    "longitude": 152.763769
  }
]
```

### Latest Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/latest_data/` | Latest storage data for all dams |
| GET | `/latest_data/<dam_id>` | Latest storage data for single dam |

**Response shape** (`/latest_data/`):
```json
[
  {
    "dam_id": "203042",
    "dam_name": "Toonumbar Dam",
    "date": "2026-01-28",
    "storage_volume": 9948.88,
    "percentage_full": 92.0,
    "storage_inflow": 1000.0,
    "storage_release": 700.0
  }
]
```

### Dam Resources (Historical Data)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dam_resources/` | Historical storage records |
| GET | `/dam_resources/<id>` | Single historical record |

**Query parameters**:
- `dam_id` - Filter by dam
- `start_date` - Filter from date (YYYY-MM-DD)
- `end_date` - Filter to date (YYYY-MM-DD)

**Example**: `/dam_resources/?dam_id=203042&start_date=2024-01-01&end_date=2024-12-31`

### Specific Dam Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/specific_dam_analysis/` | Analysis data for all dams |
| GET | `/specific_dam_analysis/<dam_id>` | Analysis data for single dam |
| GET | `/specific_dam_analysis/<dam_id>/<date>` | Analysis for dam on specific date |

**Response includes**: 12-month, 5-year, and 20-year averages for storage volume, percentage full, inflow, and release.

### Overall Dam Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/overall_dam_analysis/` | System-wide analysis |
| GET | `/overall_dam_analysis/<date>` | Analysis for specific date (YYYY-MM-DD) |

### Dam Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dam_groups/` | List all dam groups |
| GET | `/dam_groups/<group_name>` | Get single group |

**Available groups**: `sydney_dams`, `popular_dams`, `large_dams`, `small_dams`, `greatest_released`

### Dam Group Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dam_group_members/` | All group memberships |
| GET | `/dam_group_members/<group_name>` | Dams in a specific group |

## React Setup

### Environment Variables
Create `.env` in React project root:
```bash
REACT_APP_API_URL=https://backend-water-dashboard-nsw.onrender.com/api
```

For Vite projects, use:
```bash
VITE_API_URL=https://backend-water-dashboard-nsw.onrender.com/api
```

### Example API Service
```javascript
// src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const api = {
  // Dams
  getDams: () => fetch(`${API_URL}/dams/`).then(res => res.json()),
  getDam: (id) => fetch(`${API_URL}/dams/${id}`).then(res => res.json()),

  // Latest Data
  getLatestData: () => fetch(`${API_URL}/latest_data/`).then(res => res.json()),
  getLatestDataForDam: (id) => fetch(`${API_URL}/latest_data/${id}`).then(res => res.json()),

  // Historical Data
  getDamResources: (params) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_URL}/dam_resources/?${query}`).then(res => res.json());
  },

  // Groups
  getDamGroups: () => fetch(`${API_URL}/dam_groups/`).then(res => res.json()),
  getDamGroupMembers: (group) => fetch(`${API_URL}/dam_group_members/${group}`).then(res => res.json()),

  // Analysis
  getOverallAnalysis: () => fetch(`${API_URL}/overall_dam_analysis/`).then(res => res.json()),
  getDamAnalysis: (id) => fetch(`${API_URL}/specific_dam_analysis/${id}`).then(res => res.json()),
};
```

### Example React Hook
```javascript
// src/hooks/useDams.js
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function useDams() {
  const [dams, setDams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getDams()
      .then(setDams)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { dams, loading, error };
}
```

## Netlify Deployment

### Build Settings
| Setting | Create React App | Vite |
|---------|------------------|------|
| Build command | `npm run build` | `npm run build` |
| Publish directory | `build` | `dist` |

### SPA Routing
Create `public/_redirects`:
```
/*    /index.html   200
```

### Environment Variables in Netlify
Add in Netlify Dashboard → Site settings → Environment variables:
- `REACT_APP_API_URL` = `https://backend-water-dashboard-nsw.onrender.com/api`

## Important Notes

1. **Cold Starts**: Render free tier sleeps after 15 minutes of inactivity. First request may take 30-60 seconds. Show a loading indicator.

2. **Error Handling**: API returns `{"message": "..."}` for errors with appropriate HTTP status codes (404, 400, 500).

3. **Date Format**: All dates use ISO format `YYYY-MM-DD`.

4. **Decimal Values**: Storage volumes and percentages are returned as floats.

## Database Schema Reference

```
dams
├── dam_id (PK)
├── dam_name
├── full_volume
├── latitude
└── longitude

latest_data
├── dam_id (PK, FK → dams)
├── dam_name
├── date
├── storage_volume
├── percentage_full
├── storage_inflow
└── storage_release

dam_resources
├── id (PK)
├── dam_id (FK → dams)
├── date
├── storage_volume
├── percentage_full
├── storage_inflow
└── storage_release

dam_groups
└── group_name (PK)

dam_group_members
├── group_name (PK, FK → dam_groups)
└── dam_id (PK, FK → dams)
```
