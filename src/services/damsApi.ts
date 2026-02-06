// src/services/damsApi.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config/apiConfig';
import {
  Dam,
  DamGroup,
  DamGroupMember,
  DamResource,
  DamAnalysis,
  OverallDamAnalysis,
  Metadata,
} from '../types/types';

export const damsApi = createApi({
  reducerPath: 'damsApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Dams', 'Latest', 'Groups', 'Analyses', 'Overall', 'Resources', 'Metadata'],
  endpoints: (build) => ({
    getAllDams: build.query<Dam[], void>({
      query: () => `/dams/`,
      providesTags: (result) =>
        result
          ? [
              ...result.map((d) => ({ type: 'Dams' as const, id: d.dam_id })),
              { type: 'Dams', id: 'LIST' },
            ]
          : [{ type: 'Dams', id: 'LIST' }],
    }),
    getDamById: build.query<Dam, string>({
      query: (damId) => `/dams/${encodeURIComponent(damId)}`,
      providesTags: (_res, _err, id) => [{ type: 'Dams', id }],
    }),

    getAllLatestData: build.query<DamResource[], void>({
      query: () => `/latest_data/`,
      providesTags: () => [{ type: 'Latest', id: 'LIST' }],
    }),
    getLatestDataById: build.query<DamResource, string>({
      query: (damId) => `/latest_data/${encodeURIComponent(damId)}`,
      providesTags: (_res, _err, id) => [{ type: 'Latest', id }],
    }),

    getAllDamResources: build.query<DamResource[], void>({
      query: () => `/dam_resources/`,
      providesTags: () => [{ type: 'Resources', id: 'LIST' }],
    }),

    getSpecificDamAnalysisById: build.query<DamAnalysis[], { damId: string }>({
      query: ({ damId }) => `/specific_dam_analysis/${encodeURIComponent(damId)}`,
      providesTags: (_res, _err, { damId }) => [{ type: 'Analyses', id: damId }],
    }),

    getAllDamGroups: build.query<DamGroup[], void>({
      query: () => `/dam_groups/`,
      providesTags: () => [{ type: 'Groups', id: 'LIST' }],
    }),
    getDamGroupByName: build.query<DamGroup, string>({
      query: (name) => `/dam_groups/${encodeURIComponent(name)}`,
      providesTags: (_res, _err, name) => [{ type: 'Groups', id: name }],
    }),
    getDamGroupMembersByName: build.query<DamGroupMember[], { name: string }>({
      query: ({ name }) => `/dam_group_members/${encodeURIComponent(name)}`,
      providesTags: (_res, _err, { name }) => [{ type: 'Groups', id: `${name}_members` }],
    }),

    getAllOverallDamAnalyses: build.query<OverallDamAnalysis[], void>({
      query: () => `/overall_dam_analysis/`,
      providesTags: () => [{ type: 'Overall', id: 'LIST' }],
    }),
    getOverallDamAnalysisByDate: build.query<OverallDamAnalysis, string>({
      query: (date) => `/overall_dam_analysis/${encodeURIComponent(date)}`,
      providesTags: (_res, _err, date) => [{ type: 'Overall', id: date }],
    }),

    getMetadata: build.query<Metadata, void>({
      query: () => `/metadata/`,
      providesTags: () => [{ type: 'Metadata', id: 'LATEST' }],
    }),
  }),
});

export const {
  useGetAllDamsQuery,
  useGetDamByIdQuery,
  useGetAllLatestDataQuery,
  useGetLatestDataByIdQuery,
  useGetSpecificDamAnalysisByIdQuery,
  useGetAllDamGroupsQuery,
  useGetDamGroupByNameQuery,
  useGetDamGroupMembersByNameQuery,
  useGetAllOverallDamAnalysesQuery,
  useGetOverallDamAnalysisByDateQuery,
  useGetAllDamResourcesQuery,
  useGetMetadataQuery,
} = damsApi;
