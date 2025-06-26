import type { FC } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, AlertCircle, CheckCircle, ArrowLeft, Mail, AtSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { TextInput } from 'flowbite-react';
import { BorderBottomBeam } from '../../components/ui/BorderBottomBeam';
import { supabase } from '../../lib/supabase';

export const ForgotPasswordPage: FC = () => {
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen auth-background flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <motion.div 
            className="hidden lg:block text-white space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-6">
              <Link to="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
                <div className="gradient-primary rounded-2xl p-4 glow-primary animate-pulse-glow">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Resume MCP</h1>
                  <p className="text-white/70">AI-Powered Professional Profiles</p>
                </div>
              </Link>
              
              <div className="space-y-4">
                <h2 className="text-5xl font-bold leading-tight">
                  Check Your
                  <span className="block gradient-primary bg-clip-text text-transparent">
                    Email Inbox
                  </span>
                </h2>
                <p className="text-xl text-white/80 leading-relaxed">
                  We've sent you a secure link to reset your password. 
                  Click the link in your email to continue.
                </p>
              </div>

              <div className="space-y-4 pt-8">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white/80">Email sent successfully</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white/80">Secure password reset link</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white/80">Link expires in 1 hour</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right side - Success Message */}
          <motion.div 
            className="w-full max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="glass-card rounded-3xl p-8 glow-secondary">
              <div className="text-center mb-8">
                <div className="bg-green-500/20 rounded-full p-4 w-fit mx-auto mb-4">
                  <CheckCircle className="h-12 w-12 text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Email Sent!</h2>
                <p className="text-white/70">Check your inbox for the reset link</p>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium mb-1">Reset link sent to:</p>
                      <p className="text-white/70 text-sm break-all">{email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-white/70">
                  <p>• Check your spam folder if you don't see the email</p>
                  <p>• The reset link will expire in 1 hour</p>
                  <p>• You can request a new link if needed</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setEmail('');
                    }}
                    className="w-full py-3 px-6 text-base font-semibold rounded-xl transition-all duration-300 bg-white/10 text-white border border-white/20 hover:bg-white/20"
                  >
                    Send Another Email
                  </button>

                  <Link to="/auth/login">
                    <button className="w-full py-3 px-6 text-base font-semibold rounded-xl transition-all duration-300 text-white/70 hover:text-white">
                      Back to Sign In
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen auth-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <motion.div 
          className="hidden lg:block text-white space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
              <div className="gradient-primary rounded-2xl p-4 glow-primary animate-pulse-glow">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Resume MCP</h1>
                <p className="text-white/70">AI-Powered Professional Profiles</p>
              </div>
            </Link>


            <div className="space-y-4">
              <h2 className="text-5xl font-bold leading-tight">
                Reset Your
                <span class="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-600">
                  Password
                </span>
              </h2>
              <p className="text-xl text-white/80 leading-relaxed">
                No worries! Enter your email address and we'll send you a secure link 
                to reset your password and get back to your AI-powered resume agents.
              </p>
            </div>

            <div className="space-y-4 pt-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-white/80">Secure password reset process</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-white/80">Email verification required</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-white/80">Quick and easy process</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Reset Form */}
        <motion.div 
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="glass-card rounded-3xl p-8 glow-secondary">
            <div className="text-center mb-8">
              <Link to="/" className="lg:hidden gradient-primary rounded-2xl p-3 w-fit mx-auto mb-4 glow-primary inline-block hover:opacity-80 transition-opacity">
                <Zap className="h-8 w-8 text-white" />
              </Link>
              <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
              <p className="text-white/70">Enter your email to receive a reset link</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div 
                  className="flex items-center space-x-3 text-sm text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Email Input */}
              <div className="relative">
                <BorderBottomBeam 
                  play={emailFocused}
                  className="rounded-md"
                  colorFrom="#6366f1"
                  colorTo="#ec4899"
                  duration={2}
                  size={60}
                >
                  <TextInput
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    disabled={isLoading}
                    autoComplete="email"
                    placeholder="Email Address"
                    icon={AtSign}
                    color="auth"
                    sizing="md"
                  />
                </BorderBottomBeam>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="auth-button text-white"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending Reset Link...</span>
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="text-center space-y-3">
                <Link 
                  to="/auth/login" 
                  className="inline-flex items-center space-x-2 text-white/70 hover:text-white transition-colors focus-ring rounded px-2 py-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Sign In</span>
                </Link>
                
                <div className="text-sm">
                  <span className="text-white/60">Don't have an account? </span>
                  <Link 
                    to="/auth/signup" 
                    className="text-primary hover:text-primary/80 transition-colors font-semibold focus-ring rounded px-1"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};