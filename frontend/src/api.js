
const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Common API request function
async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // No content response
  if (response.status === 204) {
    return null;
  }

  // Get response data
  const data = await response.json().catch(() => ({}));

  // Handle errors
  if (!response.ok) {
    const error = new Error(
      data?.error?.message || "Request failed"
    );

    error.status = response.status;
    error.details = data?.error?.details || [];

    throw error;
  }

  return data;
}

// Agent API functions
export const api = {
  // Get all agents
  list(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== "" && value != null) {
        query.append(key, value);
      }
    });

    return request(`/agents?${query.toString()}`);
  },

  // Get dashboard statistics
  stats() {
    return request("/agents/stats");
  },

  // Get one agent
  get(id) {
    return request(`/agents/${id}`);
  },

  // Add new agent
  create(data) {
    return request("/agents", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update agent
  update(id, data) {
    return request(`/agents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Delete agent
  remove(id) {
    return request(`/agents/${id}`, {
      method: "DELETE",
    });
  },
};
