import { SignIn as SignInClerk } from '@clerk/clerk-react'

export const SignIn = () => {
    return (
        <SignInClerk redirectUrl={"/"} />
    )
}