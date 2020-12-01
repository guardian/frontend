// model: https://github.com/guardian/discussion-api/blob/master/discussion-api/src/main/scala/com.gu.discussion.api/model/Profile.scala#L26

declare type DiscussionProfile = {
  apiUrl: string;
  avatar: string;
  badge: Array<{
    name: string;
  }>;
  details: {
    about: string;
    age: string;
    gender: string;
    interests: string;
    location: string;
    realName: string;
    webPage: string;
  };
  displayName: string;
  isStaff?: boolean;
  privateFields: {
    canPostComment: boolean;
    hasCommented: boolean;
    isPremoderated: boolean;
  };
  secureAvatarUrl: string;
  userId: string;
  webUrl: string;
};