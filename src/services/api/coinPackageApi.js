import { toFormData } from "../../lib/apiHelpers";
import { baseApi } from "./baseApi";

export const coinPackageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCoinPackages: builder.query({
      query: () => "/coin-package/v1/list",
      transformResponse: (response) => response?.data ?? [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "CoinPackages", id })),
              { type: "CoinPackages", id: "LIST" },
            ]
          : [{ type: "CoinPackages", id: "LIST" }],
    }),

    createCoinPackage: builder.mutation({
      query: (values) => ({
        url: "/coin-package/v1/create",
        method: "POST",
        body: toFormData(values),
      }),
      transformResponse: (response) => response?.message,
      invalidatesTags: [{ type: "CoinPackages", id: "LIST" }],
    }),

    updateCoinPackage: builder.mutation({
      query: ({ id, values }) => ({
        url: `/coin-package/v1/update/${id}`,
        method: "PATCH",
        body: toFormData(values),
      }),
      transformResponse: (response) => response?.message,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CoinPackages", id },
        { type: "CoinPackages", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCoinPackagesQuery,
  useCreateCoinPackageMutation,
  useUpdateCoinPackageMutation,
} = coinPackageApi;
