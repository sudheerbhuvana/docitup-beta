import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FloatingNav } from '@/components/ui/floating-navbar';
import { Home, Info, Mail as MailIcon } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      icon: <MailIcon className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
  ];

  // Get email from location state or query params
  const email = location.state?.email || new URLSearchParams(location.search).get('email') || '';

  useEffect(() => {
    if (!email) {
      toast.error('Email is required for verification');
      navigate('/register');
    }
  }, [email, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOTPChange = (value: string) => {
    setOtp(value);
    // Auto-submit when 6 digits are entered
    if (value.length === 6) {
      handleVerify(value);
    }
  };

  const handleVerify = async (code?: string) => {
    const codeToVerify = code || otp;
    
    if (codeToVerify.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(email, codeToVerify);
      toast.success('Email verified successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('❌ OTP verification error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Verification failed';
      toast.error(errorMessage);
      
      // Clear OTP on error
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) {
      return;
    }

    setResendLoading(true);
    try {
      await resendOTP(email);
      toast.success('OTP code has been resent to your email');
      setResendCooldown(60); // 60 second cooldown
    } catch (error: any) {
      console.error('❌ Resend OTP error:', error);
      toast.error(error.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
      <FloatingNav navItems={navItems} />
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20" />
      
      {/* Animated background lines */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">Verify Your Email</CardTitle>
            <CardDescription className="text-gray-400 text-base">
              We've sent a 6-digit verification code to
              <br />
              <span className="text-white font-medium">{email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={handleOTPChange}
                  disabled={loading}
                >
                  <InputOTPGroup className="gap-2">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="w-14 h-14 text-lg font-semibold bg-zinc-800/50 border-zinc-700 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg transition-all"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <p className="text-center text-sm text-gray-400">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <Button
              onClick={() => handleVerify()}
              disabled={loading || otp.length !== 6}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/25 transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                'Verify Email'
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-400">
                Didn't receive the code?
              </p>
              <Button
                variant="ghost"
                onClick={handleResend}
                disabled={resendLoading || resendCooldown > 0}
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
              >
                {resendLoading ? (
                  'Sending...'
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  'Resend Code'
                )}
              </Button>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to registration
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

