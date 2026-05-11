import { ApplicationStatus } from './application-status.enum';

export const APPLICATION_TRANSITIONS: {
  [key in ApplicationStatus]: ApplicationStatus[];
} = {
  DRAFT: [ApplicationStatus.SUBMITTED],
  SUBMITTED: [ApplicationStatus.UNDER_REVIEW],
  UNDER_REVIEW: [
    ApplicationStatus.INFO_REQUESTED,
    ApplicationStatus.REVIEW_COMPLETED,
  ],
  INFO_REQUESTED: [ApplicationStatus.RESUBMITTED],
  RESUBMITTED: [ApplicationStatus.UNDER_REVIEW],
  REVIEW_COMPLETED: [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED],
  APPROVED: [],
  REJECTED: [],
};
