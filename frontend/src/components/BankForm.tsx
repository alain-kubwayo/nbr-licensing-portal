import FormWrapper from "./FormWrapper";

type BankData = {
    bankName: string
    registrationNumber: string
    bankAddress: string
}

type BankFormProps = BankData & {
    updateFields: (fields: Partial<BankData>) => void
}

const BankForm = ({ bankName, registrationNumber, bankAddress, updateFields }: BankFormProps) => {

  return (
    <FormWrapper title="Bank Info.">
        <label>Bank Name</label>
        <input autoFocus required type="text" value={bankName} onChange={e => updateFields({ bankName: e.target.value })} />
        <label>Registration Number</label>
        <input required type="text" value={registrationNumber} onChange={e => updateFields({ registrationNumber: e.target.value })} />
        <label>Bank Address</label>
        <input required type="text" value={bankAddress}  onChange={e => updateFields({ bankAddress: e.target.value })} />
    </FormWrapper>
  )
}

export default BankForm;
