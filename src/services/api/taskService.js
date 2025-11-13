import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

export const taskService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return [];
      }

      const response = await apperClient.fetchRecords('tasks_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "dueDate_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "projectId_c"}},
          {"field": {"Name": "completedAt_c"}},
          {"field": {"Name": "parentTaskId_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error?.response?.data?.message || error);
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

      const response = await apperClient.getRecordById('tasks_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "dueDate_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "projectId_c"}},
          {"field": {"Name": "completedAt_c"}},
          {"field": {"Name": "parentTaskId_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(taskData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return null;
      }

      const params = {
        records: [{
          title_c: taskData.title || taskData.title_c,
          ...(taskData.description && { description_c: taskData.description }),
          ...(taskData.dueDate && { dueDate_c: taskData.dueDate }),
          status_c: taskData.status === "in-progress" ? "inProgress" : taskData.status || "todo",
          priority_c: taskData.priority || "medium",
          ...(taskData.projectId && { projectId_c: parseInt(taskData.projectId) }),
          ...(taskData.parentTaskId && { parentTaskId_c: parseInt(taskData.parentTaskId) })
        }]
      };

      const response = await apperClient.createRecord('tasks_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} tasks:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error('Error creating task:', error?.response?.data?.message || error);
      return null;
    }
  },

  async update(id, taskData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return null;
      }

      const updateData = {
        Id: parseInt(id)
      };

      if (taskData.title) updateData.title_c = taskData.title;
      if (taskData.description !== undefined) updateData.description_c = taskData.description;
      if (taskData.dueDate !== undefined) updateData.dueDate_c = taskData.dueDate;
      if (taskData.status) {
        updateData.status_c = taskData.status === "in-progress" ? "inProgress" : taskData.status;
        // Handle completion timestamp
        if (taskData.status === "done") {
          updateData.completedAt_c = new Date().toISOString();
        } else {
          updateData.completedAt_c = null;
        }
      }
      if (taskData.priority) updateData.priority_c = taskData.priority;
      if (taskData.projectId) updateData.projectId_c = parseInt(taskData.projectId);
      if (taskData.parentTaskId) updateData.parentTaskId_c = parseInt(taskData.parentTaskId);

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord('tasks_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} tasks:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error('Error updating task:', error?.response?.data?.message || error);
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

      const response = await apperClient.deleteRecord('tasks_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} tasks:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length > 0;
      }
    } catch (error) {
      console.error('Error deleting task:', error?.response?.data?.message || error);
      return false;
    }
  },

  async getByProject(projectId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return [];
      }

      const response = await apperClient.fetchRecords('tasks_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "dueDate_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "projectId_c"}},
          {"field": {"Name": "completedAt_c"}},
          {"field": {"Name": "parentTaskId_c"}}
        ],
        where: [{
          "FieldName": "projectId_c",
          "Operator": "EqualTo",
          "Values": [parseInt(projectId)]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching tasks by project:', error?.response?.data?.message || error);
      return [];
    }
  },

  async getByStatus(status) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return [];
      }

      const dbStatus = status === "in-progress" ? "inProgress" : status;

      const response = await apperClient.fetchRecords('tasks_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "dueDate_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "projectId_c"}},
          {"field": {"Name": "completedAt_c"}},
          {"field": {"Name": "parentTaskId_c"}}
        ],
        where: [{
          "FieldName": "status_c",
          "Operator": "EqualTo",
          "Values": [dbStatus]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching tasks by status:', error?.response?.data?.message || error);
      return [];
    }
  },

  async getByDateRange(startDate, endDate) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return [];
      }

      const response = await apperClient.fetchRecords('tasks_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "dueDate_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "projectId_c"}},
          {"field": {"Name": "completedAt_c"}},
          {"field": {"Name": "parentTaskId_c"}}
        ],
        whereGroups: [{
          "operator": "AND",
          "subGroups": [{
            "conditions": [
              {
                "fieldName": "dueDate_c",
                "operator": "GreaterThanOrEqualTo",
                "values": [startDate]
              },
              {
                "fieldName": "dueDate_c",
                "operator": "LessThanOrEqualTo",
                "values": [endDate]
              }
            ],
            "operator": "AND"
          }]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching tasks by date range:', error?.response?.data?.message || error);
      return [];
    }
  },

  async search(query) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return [];
      }

      const response = await apperClient.fetchRecords('tasks_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "dueDate_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "projectId_c"}},
          {"field": {"Name": "completedAt_c"}},
          {"field": {"Name": "parentTaskId_c"}}
        ],
        whereGroups: [{
          "operator": "OR",
          "subGroups": [{
            "conditions": [
              {
                "fieldName": "title_c",
                "operator": "Contains",
                "values": [query]
              },
              {
                "fieldName": "description_c",
                "operator": "Contains",
                "values": [query]
              }
            ],
            "operator": "OR"
          }]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error searching tasks:', error?.response?.data?.message || error);
      return [];
    }
  },

  // Subtask operations
  async getSubtasks(parentTaskId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return [];
      }

      const response = await apperClient.fetchRecords('tasks_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "dueDate_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "projectId_c"}},
          {"field": {"Name": "completedAt_c"}},
          {"field": {"Name": "parentTaskId_c"}}
        ],
        where: [{
          "FieldName": "parentTaskId_c",
          "Operator": "EqualTo",
          "Values": [parseInt(parentTaskId)]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching subtasks:', error?.response?.data?.message || error);
      return [];
    }
  },

  async createSubtask(parentTaskId, subtaskData) {
    return await this.create({
      ...subtaskData,
      parentTaskId: parseInt(parentTaskId)
    });
  },

  async getMainTasks() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return [];
      }

      const response = await apperClient.fetchRecords('tasks_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "dueDate_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "projectId_c"}},
          {"field": {"Name": "completedAt_c"}},
          {"field": {"Name": "parentTaskId_c"}}
        ],
        where: [{
          "FieldName": "parentTaskId_c",
          "Operator": "DoesNotHaveValue",
          "Values": []
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching main tasks:', error?.response?.data?.message || error);
      return [];
    }
  },

  async updateSubtaskStatus(subtaskId, status) {
    return await this.update(subtaskId, { status });
  },

  async deleteSubtask(subtaskId) {
    return await this.delete(subtaskId);
  },

  async getTaskWithSubtasks(taskId) {
    try {
      const mainTask = await this.getById(taskId);
      if (!mainTask) return null;

      const subtasks = await this.getSubtasks(taskId);
      return {
        ...mainTask,
        subtasks
      };
    } catch (error) {
      console.error('Error fetching task with subtasks:', error);
      return null;
    }
  }
};