// ✅ add this first, before any imports that read API_BASE_URL
import { vi } from 'vitest';

// Force an absolute base URL for Node/Undici during tests
vi.mock('../config/apiConfig', () => ({
  API_BASE_URL: 'http://localhost/api',
}));

import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import {
  damsApi,
  useGetAllDamsQuery,
  useGetDamByIdQuery,
  useGetAllLatestDataQuery,
  useGetLatestDataByIdQuery,
} from './damsApi';

import { API_BASE_URL } from '../config/apiConfig';

// --- Mock data ---
const dams = [
  { dam_id: 'A', dam_name: 'Alpha', full_volume: 100 },
  { dam_id: 'B', dam_name: 'Bravo', full_volume: 200 },
];

const latestList = [
  { dam_id: 'A', date: '2025-01-01', storage_volume: 50 },
  { dam_id: 'B', date: '2025-01-01', storage_volume: 190 },
];

// --- MSW server ---
// NOTE: handlers now match absolute URLs using the mocked API_BASE_URL
const server = setupServer(
  http.get(`${API_BASE_URL}/dams/`, () => HttpResponse.json(dams)),
  http.get(`${API_BASE_URL}/dams/:id`, ({ params }) => {
    const id = params.id as string;
    const match = dams.find((d) => d.dam_id === id);
    return match ? HttpResponse.json(match) : new HttpResponse(null, { status: 404 });
  }),
  http.get(`${API_BASE_URL}/latest_data/`, () => HttpResponse.json(latestList)),
  http.get(`${API_BASE_URL}/latest_data/:id`, ({ params }) => {
    const id = params.id as string;
    const match = latestList.find((d) => d.dam_id === id);
    return match ? HttpResponse.json(match) : new HttpResponse(null, { status: 404 });
  })
);

// --- Store factory ---
function makeStore() {
  return configureStore({
    reducer: { [damsApi.reducerPath]: damsApi.reducer },
    middleware: (gDM) => gDM().concat(damsApi.middleware),
  });
}

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const store = makeStore();
  return <Provider store={store}>{children}</Provider>;
};

// --- Lifecycle ---
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// --- Tests ---
describe('damsApi (RTK Query)', () => {
  it('fetches all dams', async () => {
    const { result } = renderHook(() => useGetAllDamsQuery(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(dams);
  });

  it('fetches a dam by id (with encodeURIComponent)', async () => {
    const trickyId = 'WARR 100%/main';
    const trickyDam = { dam_id: trickyId, dam_name: 'Warragamba Tricky', full_volume: 999 };

    server.use(
      http.get(`${API_BASE_URL}/dams/:id`, ({ params }) => {
        const id = params.id as string;
        if (id === trickyId) return HttpResponse.json(trickyDam);
        return new HttpResponse(null, { status: 404 });
      })
    );

    const { result } = renderHook(() => useGetDamByIdQuery(trickyId), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(trickyDam);
  });

  it('fetches all latest data', async () => {
    const { result } = renderHook(() => useGetAllLatestDataQuery(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(latestList);
  });

  it('fetches latest data by id', async () => {
    const { result } = renderHook(() => useGetLatestDataByIdQuery('B'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(latestList[1]);
  });
});
