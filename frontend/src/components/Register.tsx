import { useState, type FormEvent } from "react";
import { useRegister } from "../hooks/useRegister"
import AccountForm from "./AccountForm";
import BankForm from "./BankForm";
import { Button } from "./ui/button";

type FormData = {
  bankName: string,
  registrationNumber: string,
  bankAddress: string,
  firstName: string,
  lastName: string,
  email: string,
  password: string
}

const INITIAL_DATA: FormData = {
  bankName: "",
  registrationNumber: "",
  bankAddress: "",
  firstName: "",
  lastName: "",
  email: "",
  password: ""
}

const Register = () => {
  const [data, setData] = useState(INITIAL_DATA);
  function updateFields(fields: Partial<FormData>) {
    setData(prev => {
      return {...prev, ...fields}
    })
  }
  const { steps, currentStepIndex, step, isFirstStep,isLastStep, back, next } = useRegister([
    <BankForm {...data} updateFields={updateFields} />,
    <AccountForm {...data} updateFields={updateFields} />
  ]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if(!isLastStep) return next();

    // POST data to create account
    console.log("Successful account creation", data);
  }

  return (
    <div className="relative bg-white border border-black p-4 m-4 rounded-2xl w-full max-w-md mx-auto">
      <form onSubmit={onSubmit}>
        <div className="absolute top-2 right-5">
          {currentStepIndex + 1} / {steps.length}
        </div>
        {step}
        <div className="mt-4 flex gap-2 justify-end">
          {!isFirstStep && <Button type="button" onClick={back}>Back</Button>}
          <Button type="submit">{isLastStep ? "Create" : "Next" }</Button>
         </div>
      </form>
    </div>
  )
}

export default Register
