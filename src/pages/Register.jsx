import RegistrationForm from '../components/RegistrationForm'

function Register() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14">
      <h1 className="text-3xl font-bold text-gold sm:text-4xl">Event Registration</h1>
      <p className="mt-3 text-slate-300">Complete your registration and share payment details to confirm your seat.</p>
      <div className="mt-8">
        <RegistrationForm />
      </div>
    </section>
  )
}

export default Register
