import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

interface AuthPageProps {
  onSuccess: () => void;
}

export function AuthPage({ onSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => setIsLogin(!isLogin);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm onSuccess={onSuccess} onToggleMode={toggleMode} />
        ) : (
          <RegisterForm onSuccess={onSuccess} onToggleMode={toggleMode} />
        )}
      </div>
    </div>
  );
}