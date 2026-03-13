const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const lessonPlanService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/lesson-plans`);
    if (!response.ok) {
      throw new Error('Failed to fetch lesson plans');
    }
    return response.json();
  },

  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/lesson-plans/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch lesson plan');
    }
    return response.json();
  },

  async create(lessonPlanData) {
    const response = await fetch(`${API_BASE_URL}/lesson-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lessonPlanData),
    });
    if (!response.ok) {
      throw new Error('Failed to create lesson plan');
    }
    return response.json();
  },

  async update(id, lessonPlanData) {
    const response = await fetch(`${API_BASE_URL}/lesson-plans/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lessonPlanData),
    });
    if (!response.ok) {
      throw new Error('Failed to update lesson plan');
    }
    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/lesson-plans/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete lesson plan');
    }
    return response.status === 204 ? null : response.json();
  },
};
