import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type JoinMode = "create" | "join";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  url: string;
}

interface InterviewRoomState {
  // Room connection state
  roomName: string;
  participantName: string;
  token: string;
  isLoadingToken: boolean;
  hasJoined: boolean;
  joinMode: JoinMode;
  formRoomName: string;
  generatedRoomCode: string;
  recentRooms: string[];

  // UI state
  isFullscreen: boolean;
  showSettings: boolean;
  showEndCallConfirm: boolean;
  showEmailDialog: boolean;
  showTemplateManager: boolean;

  // Chat and notes
  chatMessage: string;
  currentNote: string;

  // Call state
  callDuration: number;
  callStartTime: number | null;

  // Media state
  testingSetup: boolean;
  hasMediaPermissions: boolean;
  mediaPermissionsChecked: boolean;

  // Email state
  emailRecipient: string;
  emailMessage: string;
  isSendingEmail: boolean;

  // Recording state
  recordingUrl: string | null;
  isProcessingRecording: boolean;
  uploadedFiles: UploadedFile[];

  // Copied state
  copied: boolean;

  // Actions
  setRoomName: (name: string) => void;
  setParticipantName: (name: string) => void;
  setToken: (token: string) => void;
  setIsLoadingToken: (loading: boolean) => void;
  setHasJoined: (joined: boolean) => void;
  setJoinMode: (mode: JoinMode) => void;
  setFormRoomName: (name: string) => void;
  setGeneratedRoomCode: (code: string) => void;
  setRecentRooms: (rooms: string[]) => void;
  addRecentRoom: (room: string) => void;

  setIsFullscreen: (fullscreen: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowEndCallConfirm: (show: boolean) => void;
  setShowEmailDialog: (show: boolean) => void;
  setShowTemplateManager: (show: boolean) => void;

  setChatMessage: (message: string) => void;
  setCurrentNote: (note: string) => void;

  setCallDuration: (duration: number) => void;
  incrementCallDuration: () => void;
  setCallStartTime: (time: number | null) => void;

  setTestingSetup: (testing: boolean) => void;
  setHasMediaPermissions: (has: boolean) => void;
  setMediaPermissionsChecked: (checked: boolean) => void;

  setEmailRecipient: (email: string) => void;
  setEmailMessage: (message: string) => void;
  setIsSendingEmail: (sending: boolean) => void;

  setRecordingUrl: (url: string | null) => void;
  setIsProcessingRecording: (processing: boolean) => void;
  setUploadedFiles: (files: UploadedFile[]) => void;
  addUploadedFile: (file: UploadedFile) => void;

  setCopied: (copied: boolean) => void;

  // Reset
  resetRoomState: () => void;
  resetEmailState: () => void;
  resetChatState: () => void;
}

const initialState = {
  // Room connection state
  roomName: "",
  participantName: "",
  token: "",
  isLoadingToken: true,
  hasJoined: false,
  joinMode: "create" as JoinMode,
  formRoomName: "",
  generatedRoomCode: "",
  recentRooms: [],

  // UI state
  isFullscreen: false,
  showSettings: false,
  showEndCallConfirm: false,
  showEmailDialog: false,
  showTemplateManager: false,

  // Chat and notes
  chatMessage: "",
  currentNote: "",

  // Call state
  callDuration: 0,
  callStartTime: null as number | null,

  // Media state
  testingSetup: false,
  hasMediaPermissions: false,
  mediaPermissionsChecked: false,

  // Email state
  emailRecipient: "",
  emailMessage: "",
  isSendingEmail: false,

  // Recording state
  recordingUrl: null as string | null,
  isProcessingRecording: false,
  uploadedFiles: [] as UploadedFile[],

  // Copied state
  copied: false,
};

export const useInterviewRoomStore = create<InterviewRoomState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Room connection setters
        setRoomName: (name) => set({ roomName: name }),
        setParticipantName: (name) => set({ participantName: name }),
        setToken: (token) => set({ token }),
        setIsLoadingToken: (loading) => set({ isLoadingToken: loading }),
        setHasJoined: (joined) => set({ hasJoined: joined }),
        setJoinMode: (mode) => set({ joinMode: mode }),
        setFormRoomName: (name) => set({ formRoomName: name }),
        setGeneratedRoomCode: (code) => set({ generatedRoomCode: code }),
        setRecentRooms: (rooms) => set({ recentRooms: rooms }),
        addRecentRoom: (room) =>
          set((state) => ({
            recentRooms: [room, ...state.recentRooms.filter((r) => r !== room)].slice(0, 10),
          })),

        // UI setters
        setIsFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),
        setShowSettings: (show) => set({ showSettings: show }),
        setShowEndCallConfirm: (show) => set({ showEndCallConfirm: show }),
        setShowEmailDialog: (show) => set({ showEmailDialog: show }),
        setShowTemplateManager: (show) => set({ showTemplateManager: show }),

        // Chat and notes
        setChatMessage: (message) => set({ chatMessage: message }),
        setCurrentNote: (note) => set({ currentNote: note }),

        // Call duration
        setCallDuration: (duration) => set({ callDuration: duration }),
        incrementCallDuration: () =>
          set((state) => ({ callDuration: state.callDuration + 1 })),
        setCallStartTime: (time) => set({ callStartTime: time }),

        // Media state
        setTestingSetup: (testing) => set({ testingSetup: testing }),
        setHasMediaPermissions: (has) => set({ hasMediaPermissions: has }),
        setMediaPermissionsChecked: (checked) => set({ mediaPermissionsChecked: checked }),

        // Email state
        setEmailRecipient: (email) => set({ emailRecipient: email }),
        setEmailMessage: (message) => set({ emailMessage: message }),
        setIsSendingEmail: (sending) => set({ isSendingEmail: sending }),

        // Recording state
        setRecordingUrl: (url) => set({ recordingUrl: url }),
        setIsProcessingRecording: (processing) => set({ isProcessingRecording: processing }),
        setUploadedFiles: (files) => set({ uploadedFiles: files }),
        addUploadedFile: (file) =>
          set((state) => ({ uploadedFiles: [...state.uploadedFiles, file] })),

        // Copied state
        setCopied: (copied) => set({ copied }),

        // Reset
        resetRoomState: () =>
          set({
            roomName: "",
            participantName: "",
            token: "",
            isLoadingToken: true,
            hasJoined: false,
            callDuration: 0,
            callStartTime: null,
          }),
        resetEmailState: () =>
          set({
            emailRecipient: "",
            emailMessage: "",
            isSendingEmail: false,
          }),
        resetChatState: () =>
          set({
            chatMessage: "",
            currentNote: "",
          }),
      }),
      {
        name: "interview-room-store",
        partialize: (state) => ({
          recentRooms: state.recentRooms,
        }),
      }
    )
  )
);
