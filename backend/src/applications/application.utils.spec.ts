import { ApplicationStatus } from './application-status.enum';
import { APPLICATION_TRANSITIONS } from './application.constants';
import { canTransition } from './application.utils';

describe('canTransition', () => {
  describe('valid transitions', () => {
    it('DRAFT → SUBMITTED', () => {
      expect(
        canTransition(ApplicationStatus.DRAFT, ApplicationStatus.SUBMITTED),
      ).toBe(true);
    });

    it('SUBMITTED → UNDER_REVIEW', () => {
      expect(
        canTransition(
          ApplicationStatus.SUBMITTED,
          ApplicationStatus.UNDER_REVIEW,
        ),
      ).toBe(true);
    });

    it('UNDER_REVIEW → INFO_REQUESTED', () => {
      expect(
        canTransition(
          ApplicationStatus.UNDER_REVIEW,
          ApplicationStatus.INFO_REQUESTED,
        ),
      ).toBe(true);
    });

    it('UNDER_REVIEW → REVIEW_COMPLETED', () => {
      expect(
        canTransition(
          ApplicationStatus.UNDER_REVIEW,
          ApplicationStatus.REVIEW_COMPLETED,
        ),
      ).toBe(true);
    });

    it('INFO_REQUESTED → RESUBMITTED', () => {
      expect(
        canTransition(
          ApplicationStatus.INFO_REQUESTED,
          ApplicationStatus.RESUBMITTED,
        ),
      ).toBe(true);
    });

    it('RESUBMITTED → UNDER_REVIEW', () => {
      expect(
        canTransition(
          ApplicationStatus.RESUBMITTED,
          ApplicationStatus.UNDER_REVIEW,
        ),
      ).toBe(true);
    });

    it('REVIEW_COMPLETED → APPROVED', () => {
      expect(
        canTransition(
          ApplicationStatus.REVIEW_COMPLETED,
          ApplicationStatus.APPROVED,
        ),
      ).toBe(true);
    });

    it('REVIEW_COMPLETED → REJECTED', () => {
      expect(
        canTransition(
          ApplicationStatus.REVIEW_COMPLETED,
          ApplicationStatus.REJECTED,
        ),
      ).toBe(true);
    });
  });

  describe('invalid transitions — skipping states', () => {
    it('DRAFT cannot jump to UNDER_REVIEW', () => {
      expect(
        canTransition(ApplicationStatus.DRAFT, ApplicationStatus.UNDER_REVIEW),
      ).toBe(false);
    });

    it('DRAFT cannot jump to APPROVED', () => {
      expect(
        canTransition(ApplicationStatus.DRAFT, ApplicationStatus.APPROVED),
      ).toBe(false);
    });

    it('SUBMITTED cannot jump to REVIEW_COMPLETED', () => {
      expect(
        canTransition(
          ApplicationStatus.SUBMITTED,
          ApplicationStatus.REVIEW_COMPLETED,
        ),
      ).toBe(false);
    });

    it('SUBMITTED cannot jump to APPROVED', () => {
      expect(
        canTransition(ApplicationStatus.SUBMITTED, ApplicationStatus.APPROVED),
      ).toBe(false);
    });

    it('UNDER_REVIEW cannot jump to APPROVED directly', () => {
      expect(
        canTransition(
          ApplicationStatus.UNDER_REVIEW,
          ApplicationStatus.APPROVED,
        ),
      ).toBe(false);
    });

    it('INFO_REQUESTED cannot jump to UNDER_REVIEW directly (must go via RESUBMITTED)', () => {
      expect(
        canTransition(
          ApplicationStatus.INFO_REQUESTED,
          ApplicationStatus.UNDER_REVIEW,
        ),
      ).toBe(false);
    });
  });

  describe('terminal states — no outgoing transitions', () => {
    it('APPROVED has no valid outgoing transitions', () => {
      expect(APPLICATION_TRANSITIONS[ApplicationStatus.APPROVED]).toHaveLength(
        0,
      );
    });

    it('REJECTED has no valid outgoing transitions', () => {
      expect(APPLICATION_TRANSITIONS[ApplicationStatus.REJECTED]).toHaveLength(
        0,
      );
    });

    it('APPROVED cannot transition to anything', () => {
      const allStatuses = Object.values(ApplicationStatus);
      for (const target of allStatuses) {
        expect(canTransition(ApplicationStatus.APPROVED, target)).toBe(false);
      }
    });

    it('REJECTED cannot transition to anything', () => {
      const allStatuses = Object.values(ApplicationStatus);
      for (const target of allStatuses) {
        expect(canTransition(ApplicationStatus.REJECTED, target)).toBe(false);
      }
    });
  });

  describe('self-transitions are not allowed', () => {
    const allStatuses = Object.values(ApplicationStatus);
    it.each(allStatuses)('%s → %s is not a valid self-transition', (status) => {
      expect(canTransition(status, status)).toBe(false);
    });
  });
});
