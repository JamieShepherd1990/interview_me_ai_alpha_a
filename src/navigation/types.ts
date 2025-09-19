export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  InterviewFlow: {
    screen: 'RoleSelection';
    params?: { 
      interviewType?: string;
      selectedRole?: string;
    };
  };

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
};

export type InterviewStackParamList = {
  RoleSelection: {
    selectedRole?: string;
    interviewType?: string;
  };
  Interview: {
    interviewType: string;
    role: string;
  };
  Feedback: {
    sessionId: string;
    score: number;
  };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = {
  navigation: any;
  route: { params: RootStackParamList[T] };
};

export type MainTabScreenProps<T extends keyof MainTabParamList> = {
  navigation: any;
  route: { params: MainTabParamList[T] };
};

export type InterviewStackScreenProps<T extends keyof InterviewStackParamList> = {
  navigation: any;
  route: { params: InterviewStackParamList[T] };
};