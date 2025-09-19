export type RootStackParamList = {
  Main: undefined;
  InterviewFlow: {
    screen: 'RoleSelection';
    params?: { interviewType?: string };
  };
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
};

export type InterviewStackParamList = {
  RoleSelection: { interviewType?: string };
  Interview: { sessionId?: string };
  Feedback: { sessionId: string };
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