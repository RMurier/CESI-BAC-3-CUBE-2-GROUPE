import { SignIn as SignInClerk } from '@clerk/clerk-react'

export const SignIn = () => {
    return (
        <div>
            <SignInClerk
                appearance={{
                    elements: {
                        footer: "hidden",               // cache tout le footer
                        footerAction: "hidden",         // sécurité au cas où
                        footerActionText: "hidden",     // texte "Don't have an account?"
                        footerActionLink: "hidden",     // lien vers sign-up
                    },
                }}
            />

        </div>
    )
}