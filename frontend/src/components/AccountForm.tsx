import FormWrapper from "./FormWrapper";
import { Input } from "./ui/input";

type AccountData = {
    firstName: string
    lastName: string
    email: string
    password: string
}

type AccountFormProps = AccountData & {
    updateFields: (fields: Partial<AccountData>) => void
}

const AccountForm = ({ firstName, lastName, email, password, updateFields }: AccountFormProps) => {
  return (
    <FormWrapper title="Account Details">
        <label>First Name</label>
        <Input autoFocus required type="text" value={firstName} onChange={e => updateFields({ firstName: e.target.value })} />
        <label>Last Name</label>
        <Input required type="text" value={lastName} onChange={e => updateFields({ lastName: e.target.value })} />
        <label>Email</label>
        <Input required type="email" value={email} onChange={e => updateFields({ email: e.target.value })} />
        <label>Password</label>
        <Input required type="password" value={password} onChange={e => updateFields({ password: e.target.value })} />
    </FormWrapper>
  )
}

export default AccountForm;
