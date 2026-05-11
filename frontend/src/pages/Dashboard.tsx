const Dashboard = () => {
  type User = {
    id: number
    firstName: string
    lastName: string
    email: string
    password: string
    role: string
  }

  const user: Partial<User> = {
    id: 1,
    firstName: "john",
    lastName: "doe",
    email: "john.doe@gmail.com",
    role: "APPLICANT", // APPLICANT, REVIEWER, APPROVER, AUDITOR, ADMIN
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening in your account today
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Total Applications</p>
          <p className="text-2xl font-bold">12</p>
        </div>

        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold">3</p>
        </div>

        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="text-2xl font-bold">8</p>
        </div>
      </div>

      {user.role === "APPLICANT" && (
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Your Applications</h2>
          <p className="text-sm text-muted-foreground">
            Track your submitted applications and their status.
          </p>
        </div>
      )}

      {user.role === "REVIEWER" && (
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Pending Reviews</h2>
          <p className="text-sm text-muted-foreground">
            Applications waiting for your review.
          </p>
        </div>
      )}

    </div>
  )
}

export default Dashboard
