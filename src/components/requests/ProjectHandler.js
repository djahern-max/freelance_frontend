import api from '../../utils/api';

class ProjectHandler {
  static async createProject(projectData) {


    try {
      if (!projectData || typeof projectData !== 'object') {
        throw new Error('Invalid project data format');
      }

      if (!projectData.name || typeof projectData.name !== 'string') {
        throw new Error('Project name is required and must be a string');
      }

      const payload = {
        name: String(projectData.name).trim(),
        description: projectData.description || null,
      };



      const response = await api.post('/projects/', payload);

      if (!response.data?.id || !response.data?.name) {
        throw new Error('Invalid response from server');
      }

      return {
        success: true,
        data: response.data,
        error: null,
      };
    } catch (error) {
      console.error('Project creation error:', error);

      // Handle specific error cases
      if (error.response?.status === 422) {
        const detail = error.response.data?.detail;
        console.error('Validation error details:', detail);
        return {
          success: false,
          data: null,
          error: detail || 'Invalid project data',
        };
      }

      if (error.response?.status === 403) {
        return {
          success: false,
          data: null,
          error: 'Only clients can create projects',
        };
      }

      return {
        success: false,
        data: null,
        error: error.message || 'Failed to create project',
      };
    }
  }

  static async addRequestsToProject(projectId, requestIds) {
    try {
      if (!projectId) throw new Error('Project ID is required');
      if (!requestIds?.length) throw new Error('No requests selected');

      const results = await Promise.all(
        requestIds.map((requestId) =>
          api.post(`/requests/${requestId}/project`, {
            project_id: projectId,
          })
        )
      );

      // Check if all requests were added successfully
      const failed = results.filter((r) => !r.data);
      if (failed.length > 0) {
        throw new Error(`Failed to add ${failed.length} requests to project`);
      }

      return {
        success: true,
        data: results,
        error: null,
      };
    } catch (error) {
      console.error('Adding requests to project error:', error);
      return {
        success: false,
        data: null,
        error:
          error.response?.data?.detail ||
          error.message ||
          'Failed to add requests to project',
      };
    }
  }
}

export default ProjectHandler;
