import type { FormEvent } from "react";
import { Button } from "./ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";


const Login = () => {
  function onSubmit(e: FormEvent) {
    e.preventDefault();

    // POST data to log account in
    console.log("Successful account login");
  }

  return (
    <Card className="w-full max-w-md mx-auto">
        <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
                Enter your credentials to continue
            </CardDescription>
            <CardAction>
                <Button variant="link">Create Account</Button>
            </CardAction>
        </CardHeader>
        <CardContent>
            <form onSubmit={onSubmit}>
                <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            type="email"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            type="password"
                            required
                        />
                    </div>
                </div>
            </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full">
                Login
            </Button>
        </CardFooter>
    </Card>
  )
}

export default Login
