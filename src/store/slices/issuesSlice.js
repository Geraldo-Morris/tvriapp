import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  issues: [],
  filteredIssues: [],
  filters: {
    dateRange: null,
    category: null,
    status: null,
  },
};

const issuesSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    addIssue: (state, action) => {
      state.issues.push(action.payload);
    },
    updateIssue: (state, action) => {
      const index = state.issues.findIndex(issue => issue.id === action.payload.id);
      if (index !== -1) {
        state.issues[index] = action.payload;
      }
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
      state.filteredIssues = state.issues.filter(issue => {
        const dateMatch = !state.filters.dateRange || 
          (new Date(issue.date) >= new Date(state.filters.dateRange.start) &&
           new Date(issue.date) <= new Date(state.filters.dateRange.end));
        
        const categoryMatch = !state.filters.category || 
          issue.category === state.filters.category;
        
        const statusMatch = !state.filters.status || 
          issue.status === state.filters.status;
        
        return dateMatch && categoryMatch && statusMatch;
      });
    },
    assignTechnician: (state, action) => {
      const { issueId, technicianId } = action.payload;
      const issue = state.issues.find(issue => issue.id === issueId);
      if (issue) {
        issue.technicianId = technicianId;
        issue.status = 'in_progress';
        issue.assignedAt = new Date().toISOString();
      }
    },
    updateStatus: (state, action) => {
      const { issueId, status, solution, unresolvedAt, updatedAt } = action.payload;
      const issue = state.issues.find(issue => issue.id === issueId);
      if (issue) {
        issue.status = status;
        if (solution) {
          issue.solution = solution;
        }
        if (unresolvedAt) {
          issue.unresolvedAt = unresolvedAt;
        }
        if (updatedAt) {
          issue.updatedAt = updatedAt;
        }
      }
    },
  },
});

export const { 
  addIssue, 
  updateIssue, 
  setFilters, 
  assignTechnician, 
  updateStatus 
} = issuesSlice.actions;

export default issuesSlice.reducer;
