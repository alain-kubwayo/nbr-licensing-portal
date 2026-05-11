import { ApplicationStatus } from './application-status.enum';
import { APPLICATION_TRANSITIONS } from './application.constants';

export function canTransition(
  from: ApplicationStatus,
  to: ApplicationStatus,
): boolean {
  return APPLICATION_TRANSITIONS[from]?.includes(to);
}
