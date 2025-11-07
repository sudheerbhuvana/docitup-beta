import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { FloatingNav } from '@/components/ui/floating-navbar';
import { Home, Info, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecked, setUsernameChecked] = useState(false);
  const { register } = useAuth();
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

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username.length < 3) {
        setUsernameAvailable(null);
        setUsernameChecked(false);
        return;
      }

      // Validate format
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        setUsernameAvailable(false);
        setUsernameChecked(true);
        return;
      }

      setUsernameLoading(true);
      try {
        const response = await fetch(`https://api-docitup.sudheerbhuvana.in/api/auth/check-username/${username}`);
        const data = await response.json();
        setUsernameAvailable(data.available);
        setUsernameChecked(true);
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameAvailable(null);
        setUsernameChecked(false);
      } finally {
        setUsernameLoading(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Validate username
    if (!username) {
      toast.error('Username is required');
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      toast.error('Username must be 3-20 characters and contain only letters, numbers, and underscores');
      return;
    }

    if (usernameChecked && !usernameAvailable) {
      toast.error('Username is already taken');
      return;
    }

    setLoading(true);

    try {
      const result = await register(email, password, username, fullName || undefined);
      
      if (result.requiresVerification) {
        toast.success('Registration successful! Please verify your email.');
        navigate('/verify-otp', { state: { email } });
      } else {
        toast.success('Account created successfully');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative">
      <FloatingNav navItems={navItems} />
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold text-white">Create Account</h1>
          <p className="text-sm text-gray-400">Start your journaling journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Field>
            <FieldLabel htmlFor="username" className="text-white text-sm font-medium">
              Username <span className="text-red-400">*</span>
            </FieldLabel>
            <div className="relative">
              <Input
                id="username"
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]{3,20}"
                className="bg-zinc-800 text-white placeholder:text-gray-500 pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                ) : usernameChecked ? (
                  usernameAvailable ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )
                ) : null}
              </div>
            </div>
            {username && (
              <p className="text-xs mt-1 text-gray-400">
                {usernameChecked && !usernameAvailable ? (
                  <span className="text-red-400">Username is already taken</span>
                ) : usernameChecked && usernameAvailable ? (
                  <span className="text-green-400">Username is available</span>
                ) : !/^[a-zA-Z0-9_]{3,20}$/.test(username) ? (
                  <span className="text-red-400">3-20 characters, letters, numbers, and underscores only</span>
                ) : (
                  'Checking availability...'
                )}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              This cannot be changed later
            </p>
          </Field>

          <Field>
            <FieldLabel htmlFor="fullName" className="text-white text-sm font-medium">Full Name</FieldLabel>
            <Input
              id="fullName"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-zinc-800 text-white placeholder:text-gray-500"
            />
          </Field>
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
              minLength={6}
              className="bg-zinc-800 text-white placeholder:text-gray-500"
            />
          </Field>
          <ShinyButton 
            type="submit" 
            className="w-full h-11 bg-zinc-800/50 border-zinc-700 text-white font-medium rounded-lg" 
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign up →'}
          </ShinyButton>
        </form>
      </div>
    </div>
  );
}
