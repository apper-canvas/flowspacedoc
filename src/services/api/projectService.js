import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

export const projectService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return [];
      }

      const response = await apperClient.fetchRecords('projects_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "taskCount_c"}},
          {"field": {"Name": "completedCount_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching projects:', error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return null;
      }

      const response = await apperClient.getRecordById('projects_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "taskCount_c"}},
          {"field": {"Name": "completedCount_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(projectData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return null;
      }

      const params = {
        records: [{
          name_c: projectData.name || projectData.name_c,
          color_c: projectData.color || projectData.color_c || "#4F46E5",
          taskCount_c: 0,
          completedCount_c: 0
        }]
      };

      const response = await apperClient.createRecord('projects_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} projects:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error('Error creating project:', error?.response?.data?.message || error);
      return null;
    }
  },

  async update(id, projectData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return null;
      }

      const params = {
        records: [{
          Id: parseInt(id),
          ...(projectData.name && { name_c: projectData.name }),
          ...(projectData.name_c && { name_c: projectData.name_c }),
          ...(projectData.color && { color_c: projectData.color }),
          ...(projectData.color_c && { color_c: projectData.color_c }),
          ...(projectData.taskCount_c !== undefined && { taskCount_c: projectData.taskCount_c }),
          ...(projectData.completedCount_c !== undefined && { completedCount_c: projectData.completedCount_c })
        }]
      };

      const response = await apperClient.updateRecord('projects_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} projects:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error('Error updating project:', error?.response?.data?.message || error);
      return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return false;
      }

      const params = { 
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('projects_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} projects:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length > 0;
      }
    } catch (error) {
      console.error('Error deleting project:', error?.response?.data?.message || error);
      return false;
    }
  },

  async updateTaskCounts(projectId, taskCount, completedCount) {
    return await this.update(projectId, {
      taskCount_c: taskCount,
      completedCount_c: completedCount
    });
  }
};