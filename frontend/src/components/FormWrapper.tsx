import type { ReactNode } from "react"

type FormWrapperProps = {
    title: string
    children: ReactNode
}

const FormWrapper = ({ title, children }: FormWrapperProps ) => {
  return (
    <div>
      <h2 className="text-center m-0 mb-8">{title}</h2>
      <div className="grid justify-start gap-y-4 gap-x-2 grid-cols-[auto_minmax(auto,480px)]">{children}</div>
    </div>
  )
}

export default FormWrapper
