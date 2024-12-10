import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';

// Helper function to convert Firestore data to serializable format
const convertTimestamps = (data) => {
  const converted = { ...data };
  // Convert serverTimestamp fields to ISO strings
  if (converted.serverCreatedAt?.toDate) {
    converted.createdAt = converted.serverCreatedAt.toDate().toISOString();
    delete converted.serverCreatedAt;
  }
  if (converted.serverUpdatedAt?.toDate) {
    converted.updatedAt = converted.serverUpdatedAt.toDate().toISOString();
    delete converted.serverUpdatedAt;
  }
  // Convert any timestamp in history array
  if (Array.isArray(converted.history)) {
    converted.history = converted.history.map(entry => ({
      ...entry,
      timestamp: entry.timestamp?.toDate?.() 
        ? entry.timestamp.toDate().toISOString() 
        : entry.timestamp
    }));
  }
  return converted;
};

// Create a new report
export const createReport = createAsyncThunk(
  'reports/createReport',
  async (reportData, { rejectWithValue }) => {
    try {
      if (!reportData.reportedBy) {
        throw new Error('User must be authenticated to create a report');
      }

      if (reportData.status !== 'pending') {
        throw new Error('New reports must have pending status');
      }

      console.log('Creating report with data:', reportData);
      const reportRef = collection(db, 'reports');
      
      // Add server timestamp
      const reportWithTimestamp = {
        ...reportData,
        serverCreatedAt: serverTimestamp(),
        serverUpdatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(reportRef, reportWithTimestamp);
      console.log('Report created successfully with ID:', docRef.id);
      
      // Get the created document to confirm
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Failed to verify report creation');
      }
      
      // Convert timestamps and return
      const data = convertTimestamps(docSnap.data());
      return {
        id: docRef.id,
        ...data
      };
    } catch (error) {
      console.error('Error creating report:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch reports
export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      if (!user?.uid) {
        throw new Error('User must be authenticated to fetch reports');
      }

      console.log('Fetching reports for user:', user.uid, 'with role:', user.role);
      
      const reportsRef = collection(db, 'reports');
      let reportsQuery;
      
      // Handle queries based on user role
      try {
        if (user.role === 'technician') {
          console.log('Fetching reports assigned to technician:', user.uid);
          reportsQuery = query(
            reportsRef,
            where('assignedTo', '==', user.uid)
          );
        } else if (user.role === 'operator') {
          // Operators see all reports
          reportsQuery = query(reportsRef);
        } else {
          // Employee - see their own reports
          reportsQuery = query(
            reportsRef,
            where('reportedBy', '==', user.uid)
          );
        }
        
        const querySnapshot = await getDocs(reportsQuery);
        const reports = [];
        
        querySnapshot.forEach(doc => {
          const data = convertTimestamps(doc.data());
          reports.push({
            id: doc.id,
            ...data
          });
        });

        console.log(`Found ${reports.length} reports for ${user.role}`);
        if (user.role === 'technician') {
          reports.forEach(report => {
            console.log('Technician report:', {
              id: report.id,
              status: report.status,
              assignedTo: report.assignedTo,
              title: report.title
            });
          });
        }
        
        return reports;
      } catch (error) {
        console.error('Error in report query:', error);
        // If compound query fails, try without ordering
        console.log('Retrying without ordering...');
        reportsQuery = query(
          reportsRef,
          where('assignedTo', '==', user.uid)
        );
        const querySnapshot = await getDocs(reportsQuery);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...convertTimestamps(doc.data())
        }));
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Update report
export const updateReport = createAsyncThunk(
  'reports/updateReport',
  async ({ id, ...updateData }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      if (!user?.uid) {
        throw new Error('User must be authenticated to update reports');
      }

      console.log('Updating report:', { id, ...updateData });
      const reportRef = doc(db, 'reports', id);
      
      // First get the current report data
      const currentDoc = await getDoc(reportRef);
      if (!currentDoc.exists()) {
        throw new Error('Report not found');
      }
      
      const currentData = currentDoc.data();
      console.log('Current report data:', currentData);
      
      // Merge current data with updates
      const mergedData = {
        ...currentData,
        ...updateData,
        serverUpdatedAt: serverTimestamp()
      };
      
      console.log('Merged report data:', mergedData);
      await updateDoc(reportRef, mergedData);
      
      // Get the updated document
      const updatedDoc = await getDoc(reportRef);
      if (!updatedDoc.exists()) {
        throw new Error('Report not found after update');
      }
      
      // Convert timestamps and return
      const data = convertTimestamps(updatedDoc.data());
      console.log('Report updated successfully:', data);
      return {
        id,
        ...data
      };
    } catch (error) {
      console.error('Error updating report:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Update report status
export const updateReportStatus = createAsyncThunk(
  'reports/updateReportStatus',
  async ({ reportId, status, technicianId, comment }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      if (!user?.uid) {
        throw new Error('User must be authenticated to update report status');
      }

      const reportRef = doc(db, 'reports', reportId);
      const reportDoc = await getDoc(reportRef);
      
      if (!reportDoc.exists()) {
        throw new Error('Report not found');
      }

      const currentData = reportDoc.data();
      const timestamp = new Date().toISOString();

      const updateData = {
        status,
        serverUpdatedAt: serverTimestamp(),
        history: [
          ...(currentData.history || []),
          {
            status,
            timestamp,
            updatedBy: technicianId,
            action: status,
            comment: comment || `Status updated to ${status}`
          }
        ]
      };

      if (status === 'resolved') {
        updateData.resolvedAt = timestamp;
      } else if (status === 'unresolved') {
        updateData.unresolvedAt = timestamp;
      }

      await updateDoc(reportRef, updateData);
      
      const updatedDoc = await getDoc(reportRef);
      return {
        id: reportId,
        ...convertTimestamps(updatedDoc.data())
      };
    } catch (error) {
      console.error('Error updating report status:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  reports: [],
  loading: false,
  error: null
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Report
      .addCase(createReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports.unshift(action.payload);
      })
      .addCase(createReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Reports
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Report
      .addCase(updateReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReport.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reports.findIndex(report => report.id === action.payload.id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
      })
      .addCase(updateReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Report Status
      .addCase(updateReportStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReportStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reports.findIndex(report => report.id === action.payload.id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
      })
      .addCase(updateReportStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = reportsSlice.actions;
export default reportsSlice.reducer;
