import { useState, type FormEvent } from "react";
import { useRegister } from "../hooks/useRegister"
import AccountForm from "./AccountForm";
import BankForm from "./BankForm";

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
    <div style={{ 
      position: "relative", 
      background: "white", 
      border: "1px solid black",
      padding: "2rem",
      margin: "1rem",
      borderRadius: ".5rem",
      fontFamily: "Arial",
      maxWidth: "max-content"
     }}>
      <form onSubmit={onSubmit}>
        <div style={{ position: "absolute", top: ".5rem", right: ".5rem" }}>
          {currentStepIndex + 1} / {steps.length}
        </div>
        {step}
        <div style={{ 
          marginTop: "1rem",
          display: "flex",
          gap: ".5rem",
          justifyContent: "flex-end"
         }}>
          {!isFirstStep && <button type="button" onClick={back}>Back</button>}
          <button type="submit">{isLastStep ? "Create" : "Next" }</button>
         </div>
      </form>
    </div>
  )
}

export default Register
