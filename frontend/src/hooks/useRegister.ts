import { useState, type ReactElement } from "react";

export function useRegister(steps: ReactElement[]) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0); 

    function next() {
        setCurrentStepIndex(i => {
            return i >= steps.length - 1 ? i : i + 1;
        })
    }

    function back() {
        setCurrentStepIndex(i => {
            return i <= 0 ? i : i - 1;
        })
    }

    function goTo(index: number) {
        setCurrentStepIndex(index);
    }

    return {
        currentStepIndex,
        step: steps[currentStepIndex],
        steps,
        isFirstStep: currentStepIndex === 0,
        isLastStep: currentStepIndex === steps.length - 1,
        goTo,
        next,
        back
    }
}
