import { useState, type FormEvent } from "react";
import { useRegister } from "../hooks/useRegister"
import AccountForm from "../components/AccountForm";
import BankForm from "../components/BankForm";
import { Button } from "../components/ui/button";
import { Link, useNavigate } from "react-router";
import { api } from "@/services/api";

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
  const navigate = useNavigate();
  function updateFields(fields: Partial<FormData>) {
    setData(prev => {
      return {...prev, ...fields}
    })
  }
  const { steps, currentStepIndex, step, isFirstStep,isLastStep, back, next } = useRegister([
    <BankForm {...data} updateFields={updateFields} />,
    <AccountForm {...data} updateFields={updateFields} />
  ]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if(!isLastStep) return next();

    const payload = {
      email: data.email,
      name: `${data.firstName} ${data.lastName}`.trim(),
      password: data.password,
      role: "APPLICANT",
    };

    await api.post("/users", payload);
    navigate("/");
  }

  return (
    <div className="relative bg-white border border-black p-4 m-4 rounded-2xl w-full max-w-md mx-auto">
      <form onSubmit={onSubmit}>
        <div className="absolute top-2 right-5">
          {currentStepIndex + 1} / {steps.length}
        </div>
        {step}
        <div className="mt-4 flex gap-2 justify-between">
          <p className="flex items-end">
            <Link className="ml-2 underline text-blue-700" to="/">Login</Link>
          </p>
          <div>
            {!isFirstStep && <Button type="button" onClick={back}>Back</Button>}
            <Button type="submit">{isLastStep ? "Create" : "Next" }</Button>
          </div>
         </div>
      </form>
    </div>
  )
}

export default Register
