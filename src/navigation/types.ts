import { NavigatorScreenParams } from '@react-navigation/native';

// Bottom Tab Navigator Types
export type TabParamList = {
  Home: undefined;
  History: undefined;
};

// Stack Navigator Types (Modal)
export type InterviewStackParamList = {
  RoleSelection: undefined;
  Interview: {
    sessionId: string;
    interviewType: string;
    role: string;
  };
  Feedback: {
    sessionId: string;
  };
};

// Root Navigator Types
export type RootStackParamList = {
  // Main app with tabs
  MainTabs: NavigatorScreenParams<TabParamList>;
  
  // Modal stack for interview flow
  InterviewFlow: NavigatorScreenParams<InterviewStackParamList>;
  
  // Onboarding flow
  Onboarding: undefined;
  
  // Auth flow
  Auth: undefined;
  
  // Settings
  Settings: undefined;
  
  // Session detail (from history)
  SessionDetail: {
    sessionId: string;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
