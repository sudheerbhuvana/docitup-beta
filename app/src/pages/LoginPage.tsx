import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { FloatingNav } from '@/components/ui/floating-navbar';
import { Home, Info, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <Home className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Features",
      link: "#features",
      icon: <Info className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Contact",
      link: "#contact",
      icon: <Mail className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      const errorData = error.response?.data;
      
      // If email is not verified, redirect to OTP verification
      if (errorData?.requiresVerification && errorData?.email) {
        toast.error('Please verify your email before logging in');
        navigate('/verify-otp', { state: { email: errorData.email } });
      } else {
        toast.error(errorData?.error || errorData?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative">
      <FloatingNav navItems={navItems} />
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold text-white">Welcome Back</h1>
          <p className="text-sm text-gray-400">Sign in to continue to your journal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Field>
            <FieldLabel htmlFor="email" className="text-white text-sm font-medium">Email Address</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-zinc-800 text-white placeholder:text-gray-500"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password" className="text-white text-sm font-medium">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-zinc-800 text-white placeholder:text-gray-500"
            />
          </Field>
          <ShinyButton 
            type="submit" 
            className="w-full h-11 bg-zinc-800/50 border-zinc-700 text-white font-medium rounded-lg" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in →'}
          </ShinyButton>
          
          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
