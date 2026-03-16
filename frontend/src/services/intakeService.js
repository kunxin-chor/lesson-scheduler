const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const intakeService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/intakes`);
    if (!response.ok) {
      throw new Error('Failed to fetch intakes');
    }
    return response.json();
  },

  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/intakes/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch intake');
    }
    return response.json();
  },

  async create(intakeData) {
    const response = await fetch(`${API_BASE_URL}/intakes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(intakeData),
    });
    if (!response.ok) {
      throw new Error('Failed to create intake');
    }
    return response.json();
  },

  async update(id, intakeData) {
    const response = await fetch(`${API_BASE_URL}/intakes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(intakeData),
    });
    if (!response.ok) {
      throw new Error('Failed to update intake');
    }
    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/intakes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete intake');
    }
    return response.status === 204 ? null : response.json();
  },

  async updateClassSlots(id, classSlots) {
    const response = await fetch(`${API_BASE_URL}/intakes/${id}/class-slots`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ classSlots }),
    });
    if (!response.ok) {
      throw new Error('Failed to update class slots');
    }
    return response.json();
  },

  async regenerate(id, config) {
    const response = await fetch(`${API_BASE_URL}/intakes/${id}/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      throw new Error('Failed to regenerate intake');
    }
    return response.json();
  },
};
