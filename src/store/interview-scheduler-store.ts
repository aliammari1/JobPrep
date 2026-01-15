import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface Interview {
  id: string;
  candidateId?: string;
  candidateName: string;
  interviewerName: string;
  position: string;
  scheduledDate: Date;
  duration: number;
  status: "scheduled" | "in_progress" | "completed" | "canceled";
  notes?: string;
  feedback?: string;
}

export interface NewInterviewForm {
  candidateName: string;
  interviewerName: string;
  position: string;
  scheduledDate: string;
  duration: number;
  notes?: string;
}

interface InterviewSchedulerState {
  // View and data
  selectedView: "day" | "week" | "month";
  interviews: Interview[];
  loading: boolean;

  // UI state
  showNewInterviewModal: boolean;
  showEditModal: boolean;
  showDeleteConfirm: string | null;
  showFilterModal: boolean;
  showNotesModal: string | null;
  showSettingsModal: boolean;

  // Form state
  newInterviewForm: NewInterviewForm;
  formErrors: Record<string, string>;
  isSubmitting: boolean;

  // Messages
  successMessage: string | null;
  errorMessage: string | null;

  // Filters
  filterStatus: string;
  searchQuery: string;

  // Date and editing
  selectedDate: Date;
  editingInterview: Interview | null;
  notesContent: string;

  // Integration
  calendarConnected: boolean;

  // Stats and notifications
  notifications: any[];
  stats: {
    total: number;
    completed: number;
    pending: number;
    canceled: number;
  };

  // Actions
  setSelectedView: (view: "day" | "week" | "month") => void;
  setInterviews: (interviews: Interview[]) => void;
  addInterview: (interview: Interview) => void;
  updateInterview: (id: string, interview: Partial<Interview>) => void;
  deleteInterview: (id: string) => void;
  setLoading: (loading: boolean) => void;

  setShowNewInterviewModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setShowDeleteConfirm: (id: string | null) => void;
  setShowFilterModal: (show: boolean) => void;
  setShowNotesModal: (id: string | null) => void;
  setShowSettingsModal: (show: boolean) => void;

  setNewInterviewForm: (form: Partial<NewInterviewForm>) => void;
  setFormErrors: (errors: Record<string, string>) => void;
  setIsSubmitting: (submitting: boolean) => void;

  setSuccessMessage: (message: string | null) => void;
  setErrorMessage: (message: string | null) => void;

  setFilterStatus: (status: string) => void;
  setSearchQuery: (query: string) => void;

  setSelectedDate: (date: Date) => void;
  setEditingInterview: (interview: Interview | null) => void;
  setNotesContent: (content: string) => void;

  setCalendarConnected: (connected: boolean) => void;

  setNotifications: (notifications: any[]) => void;
  setStats: (stats: any) => void;

  // Reset
  resetFormState: () => void;
  clearMessages: () => void;
}

const initialState = {
  // View and data
  selectedView: "month" as const,
  interviews: [],
  loading: true,

  // UI state
  showNewInterviewModal: false,
  showEditModal: false,
  showDeleteConfirm: null as string | null,
  showFilterModal: false,
  showNotesModal: null as string | null,
  showSettingsModal: false,

  // Form state
  newInterviewForm: {
    candidateName: "",
    interviewerName: "",
    position: "",
    scheduledDate: "",
    duration: 60,
  } as NewInterviewForm,
  formErrors: {},
  isSubmitting: false,

  // Messages
  successMessage: null as string | null,
  errorMessage: null as string | null,

  // Filters
  filterStatus: "all",
  searchQuery: "",

  // Date and editing
  selectedDate: new Date(),
  editingInterview: null as Interview | null,
  notesContent: "",

  // Integration
  calendarConnected: false,

  // Stats and notifications
  notifications: [],
  stats: {
    total: 0,
    completed: 0,
    pending: 0,
    canceled: 0,
  },
};

export const useInterviewSchedulerStore = create<InterviewSchedulerState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // View and data
        setSelectedView: (view) => set({ selectedView: view }),
        setInterviews: (interviews) => set({ interviews }),
        addInterview: (interview) =>
          set((state) => ({ interviews: [...state.interviews, interview] })),
        updateInterview: (id, updates) =>
          set((state) => ({
            interviews: state.interviews.map((i) =>
              i.id === id ? { ...i, ...updates } : i,
            ),
          })),
        deleteInterview: (id) =>
          set((state) => ({
            interviews: state.interviews.filter((i) => i.id !== id),
          })),
        setLoading: (loading) => set({ loading }),

        // UI state
        setShowNewInterviewModal: (show) =>
          set({ showNewInterviewModal: show }),
        setShowEditModal: (show) => set({ showEditModal: show }),
        setShowDeleteConfirm: (id) => set({ showDeleteConfirm: id }),
        setShowFilterModal: (show) => set({ showFilterModal: show }),
        setShowNotesModal: (id) => set({ showNotesModal: id }),
        setShowSettingsModal: (show) => set({ showSettingsModal: show }),

        // Form state
        setNewInterviewForm: (form) =>
          set((state) => ({
            newInterviewForm: { ...state.newInterviewForm, ...form },
          })),
        setFormErrors: (errors) => set({ formErrors: errors }),
        setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),

        // Messages
        setSuccessMessage: (message) => set({ successMessage: message }),
        setErrorMessage: (message) => set({ errorMessage: message }),

        // Filters
        setFilterStatus: (status) => set({ filterStatus: status }),
        setSearchQuery: (query) => set({ searchQuery: query }),

        // Date and editing
        setSelectedDate: (date) => set({ selectedDate: date }),
        setEditingInterview: (interview) =>
          set({ editingInterview: interview }),
        setNotesContent: (content) => set({ notesContent: content }),

        // Integration
        setCalendarConnected: (connected) =>
          set({ calendarConnected: connected }),

        // Stats and notifications
        setNotifications: (notifications) => set({ notifications }),
        setStats: (stats) => set({ stats }),

        // Reset
        resetFormState: () =>
          set({
            newInterviewForm: {
              candidateName: "",
              interviewerName: "",
              position: "",
              scheduledDate: "",
              duration: 60,
            },
            formErrors: {},
            isSubmitting: false,
            editingInterview: null,
            showEditModal: false,
            showNewInterviewModal: false,
          }),
        clearMessages: () =>
          set({
            successMessage: null,
            errorMessage: null,
          }),
      }),
      {
        name: "interview-scheduler-store",
        partialize: (state) => ({
          filterStatus: state.filterStatus,
          searchQuery: state.searchQuery,
          selectedView: state.selectedView,
        }),
      },
    ),
  ),
);
