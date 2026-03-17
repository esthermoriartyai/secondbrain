import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="mb-8 text-center">
        <h1
          className="font-dm-sans font-bold text-[28px] tracking-tight mb-1"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Secondbrain
        </h1>
        <p className="text-[#999999] text-[14px]" style={{ fontFamily: 'Geist, sans-serif' }}>
          You save. It thinks. You find.
        </p>
      </div>
      <SignIn />
    </div>
  )
}
