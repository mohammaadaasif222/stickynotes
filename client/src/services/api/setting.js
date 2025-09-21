// store/api/systemSettingsApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASEURL } from "../../baseurl";
// Base query using your existing adminApiClient
const baseQuery = fetchBaseQuery({
  baseUrl: `${BASEURL}/system-settings`,
  prepareHeaders: (headers, { getState }) => {
    // Use your existing adminApiClient configuration
    headers.set("X-Admin-Request", "true");
    // Add any other headers from your adminApiClient
    return headers;
  },
});

export const systemSettingsApi = createApi({
  reducerPath: "systemSettingsApi",
  baseQuery,
  tagTypes: ["SystemSetting", "SettingsCount"],
  endpoints: (builder) => ({
    // GET /api/system-settings - Get all system settings with pagination and filters
    getAllSettings: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, value.toString());
          }
        });
        return `/?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "SystemSetting", id })),
              { type: "SystemSetting", id: "LIST" },
            ]
          : [{ type: "SystemSetting", id: "LIST" }],
    }),

    // GET /api/system-settings/count - Get count of system settings
    getSettingsCount: builder.query({
      query: (filters = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, value.toString());
          }
        });
        return `/count?${searchParams.toString()}`;
      },
      providesTags: [{ type: "SettingsCount", id: "COUNT" }],
    }),

    // GET /api/system-settings/:id - Get system setting by ID
    getSettingById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "SystemSetting", id }],
    }),

    // GET /api/system-settings/key/:key - Get system setting by key
    getSettingByKey: builder.query({
      query: (key) => `/key/${key}`,
      providesTags: (result, error, key) => [
        { type: "SystemSetting", id: key },
      ],
    }),

    // GET /api/system-settings/value/:key - Get setting value by key
    getSettingValue: builder.query({
      query: (key) => `/value/${key}`,
      providesTags: (result, error, key) => [
        { type: "SystemSetting", id: `value-${key}` },
      ],
    }),

    // POST /api/system-settings - Create new system setting
    createSetting: builder.mutation({
      query: (newSetting) => ({
        url: "/",
        method: "POST",
        body: newSetting,
      }),
      invalidatesTags: [
        { type: "SystemSetting", id: "LIST" },
        { type: "SettingsCount", id: "COUNT" },
      ],
    }),

    // PUT /api/system-settings/:id - Update system setting by ID
    updateSetting: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SystemSetting", id },
        { type: "SystemSetting", id: "LIST" },
      ],
    }),

    // PATCH /api/system-settings/value/:key - Update setting value by key
    updateSettingValue: builder.mutation({
      query: ({ key, value }) => ({
        url: `/value/${key}`,
        method: "PATCH",
        body: { value },
      }),
      invalidatesTags: (result, error, { key }) => [
        { type: "SystemSetting", id: key },
        { type: "SystemSetting", id: `value-${key}` },
        { type: "SystemSetting", id: "LIST" },
      ],
    }),

    // PATCH /api/system-settings/:id/deactivate - Soft delete (deactivate) system setting
    softDeleteSetting: builder.mutation({
      query: (id) => ({
        url: `/${id}/deactivate`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "SystemSetting", id },
        { type: "SystemSetting", id: "LIST" },
        { type: "SettingsCount", id: "COUNT" },
      ],
    }),

    // DELETE /api/system-settings/:id - Delete system setting by ID
    deleteSetting: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "SystemSetting", id },
        { type: "SystemSetting", id: "LIST" },
        { type: "SettingsCount", id: "COUNT" },
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetAllSettingsQuery,
  useGetSettingsCountQuery,
  useGetSettingByIdQuery,
  useGetSettingByKeyQuery,
  useGetSettingValueQuery,
  useCreateSettingMutation,
  useUpdateSettingMutation,
  useUpdateSettingValueMutation,
  useSoftDeleteSettingMutation,
  useDeleteSettingMutation,
} = systemSettingsApi;

// Custom hooks for common operations
export const useSystemSettings = (params = {}) => {
  return useGetAllSettingsQuery(params, {
    // Refetch on mount if data is older than 5 minutes
    refetchOnMountOrArgChange: 300,
  });
};

export const useSystemSettingsCount = (filters = {}) => {
  return useGetSettingsCountQuery(filters, {
    refetchOnMountOrArgChange: 300,
  });
};

export const useSystemSetting = (id) => {
  return useGetSettingByIdQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });
};

export const useSystemSettingByKey = (key) => {
  return useGetSettingByKeyQuery(key, {
    skip: !key,
    refetchOnMountOrArgChange: true,
  });
};

export const useSystemSettingValue = (key) => {
  return useGetSettingValueQuery(key, {
    skip: !key,
    refetchOnMountOrArgChange: true,
  });
};

// Custom hook for creating settings with optimistic updates
export const useCreateSystemSetting = () => {
  const [createSetting, { isLoading, error }] = useCreateSettingMutation();

  const handleCreate = async (settingData) => {
    try {
      const result = await createSetting(settingData).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return { createSetting: handleCreate, isLoading, error };
};

// Custom hook for updating settings
export const useUpdateSystemSetting = () => {
  const [updateSetting, { isLoading, error }] = useUpdateSettingMutation();

  const handleUpdate = async ({ id, ...data }) => {
    try {
      
      const result = await updateSetting({ id, ...data }).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return { updateSetting: handleUpdate, isLoading, error };
};

// Custom hook for updating setting values by key
export const useUpdateSystemSettingValue = () => {
  const [updateSettingValue, { isLoading, error }] =
    useUpdateSettingValueMutation();

  const handleUpdateValue = async (key, value) => {
    try {
      const result = await updateSettingValue({ key, value }).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return { updateSettingValue: handleUpdateValue, isLoading, error };
};

// Custom hook for deleting settings
export const useDeleteSystemSetting = () => {
  const [deleteSetting, { isLoading, error }] = useDeleteSettingMutation();
  const [
    softDeleteSetting,
    { isLoading: isSoftDeleting, error: softDeleteError },
  ] = useSoftDeleteSettingMutation();

  const handleDelete = async (id, soft = false) => {
    try {
      const mutation = soft ? softDeleteSetting : deleteSetting;
      const result = await mutation(id).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return {
    deleteSetting: handleDelete,
    isLoading: isLoading || isSoftDeleting,
    error: error || softDeleteError,
  };
};

// Utility hook for managing system settings with common operations
export const useSystemSettingsManager = (initialParams = {}) => {
  const [params, setParams] = useState(initialParams);
  const settingsQuery = useSystemSettings(params);
  const countQuery = useSystemSettingsCount(params);
  const { createSetting, isLoading: isCreating } = useCreateSystemSetting();
  const { updateSetting, isLoading: isUpdating } = useUpdateSystemSetting();
  const { deleteSetting, isLoading: isDeleting } = useDeleteSystemSetting();

  const refetch = () => {
    settingsQuery.refetch();
    countQuery.refetch();
  };

  const updateParams = (newParams) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  return {
    // Data
    settings: settingsQuery.data,
    count: countQuery.data,

    // Loading states
    isLoading: settingsQuery.isLoading || countQuery.isLoading,
    isCreating,
    isUpdating,
    isDeleting,

    // Error states
    error: settingsQuery.error || countQuery.error,

    // Actions
    createSetting,
    updateSetting,
    deleteSetting,
    refetch,

    // Params management
    params,
    updateParams,
  };
};

export default systemSettingsApi;
