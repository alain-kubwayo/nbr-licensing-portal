import { useState, type FormEvent } from "react";
import FormWrapper from "../components/FormWrapper";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Link, useNavigate } from "react-router";
import { api } from "@/services/api";

type LoginData = {
    email: string
    password: string
}

const INITIAL_DATA: LoginData = {
  email: "",
  password: ""
}

type LoginFormProps = LoginData & {
    updateFields: (fields: Partial<LoginData>) => void
}

const Login = ({ email, password }: LoginFormProps) => {
    const [data, setData] = useState(INITIAL_DATA);
    const navigate = useNavigate();
    function updateFields(fields: Partial<LoginData>) {
        setData(prev => {
        return {...prev, ...fields}
        })
    }

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await api.post("/auth/login", data);
        navigate("/dashboard");
    }

  return (
    <div className="relative bg-white border border-black p-4 m-4 rounded-2xl w-full max-w-md mx-auto">
        <form onSubmit={onSubmit}>
        <FormWrapper title="Login">
            <label>Email</label>
            <Input autoFocus required type="email" value={email} onChange={e => updateFields({ email: e.target.value })} />
            <label>Password</label>
            <Input required type="password" value={password} onChange={e => updateFields({ password: e.target.value })} />
            <p className="flex items-end">
                <Link className="ml-2 underline text-blue-700" to="/register">Register</Link>
            </p>
            <div className="mt-4 flex w-full justify-end">
                <Button type="submit">Login</Button>
            </div>
        </FormWrapper>
        </form>
    </div>
  )
}

export default Login;
