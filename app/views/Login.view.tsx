import SocialButton from "../components/atomic/SocialButton";
import { GoogleIcon, GitHubIcon, FacebookIcon } from "../components/atomic/icons";
import LoginForm from "../components/compound/LoginForm";

export default function LoginView() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-900">
      <main className="w-full max-w-md px-6">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Sign in to continue
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />
          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-300 dark:border-zinc-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <SocialButton icon={<GoogleIcon />} />
            <SocialButton icon={<GitHubIcon />} />
            <SocialButton icon={<FacebookIcon />} />
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mt-6">
            Don&apos;t have an account?{" "}
            <a href="#" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
