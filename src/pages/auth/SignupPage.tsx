import type { FC } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, AlertCircle, Eye, EyeOff, AtSign, SquareAsterisk } from 'lucide-react';
import { motion } from 'framer-motion';
import { TextInput } from 'flowbite-react';
import { BorderBottomBeam } from '../../components/ui/BorderBottomBeam';
import { useAuthStore } from '../../store/auth';

export const SignupPage: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    const result = await signup(email, password);
    
    if (result.error) {
      setError(result.error);
    } else {
      // Successfully signed up and automatically signed in - navigate to dashboard
      navigate('/dashboard');
    }
  };

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
                Join the
                <span className="block gradient-primary bg-clip-text text-transparent">
                  Resume Revolution
                </span>
              </h2>
              <p className="text-xl text-white/80 leading-relaxed">
                Create intelligent resume agents that work 24/7 to land you better opportunities. 
                Your professional profile becomes an AI-powered advocate.
              </p>
            </div>

            <div className="space-y-4 pt-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-white/80">AI agents that negotiate on your behalf</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-white/80">Smart analytics and performance tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-white/80">Modular blocks for dynamic resumes</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Signup Form */}
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
              <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-white/70">Start building AI-powered resumes today</p>
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

              <div className="space-y-6">
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
                      theme={{
                        field: {
                          input: {
                            base: "block w-full bg-transparent border-0 border-b-2 border-white/20 text-white placeholder-transparent focus:outline-none focus:ring-0 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 pl-10",
                            sizes: {
                              md: "py-2.5 text-base"
                            }
                          },
                          icon: {
                            base: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3",
                            svg: "h-5 w-5 text-white/60"
                          }
                        }
                      }}
                    />
                  </BorderBottomBeam>
                </div>

                {/* Password Input */}
                <div className="relative">
                  <BorderBottomBeam 
                    play={passwordFocused}
                    className="rounded-md"
                    colorFrom="#6366f1"
                    colorTo="#ec4899"
                    duration={2}
                    size={60}
                  >
                    <div className="relative">
                      <TextInput
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        icon={SquareAsterisk}
                        disabled={isLoading}
                        autoComplete="new-password"
                        placeholder="Password (min. 6 characters)"
                        theme={{
                          field: {
                            input: {
                              base: "block w-full bg-transparent border-0 border-b-2 border-white/20 text-white placeholder-transparent focus:outline-none focus:ring-0 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 pr-12",
                              sizes: {
                                md: "py-2.5 text-base"
                              }
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle"
                        disabled={isLoading}
                        tabIndex={0}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </BorderBottomBeam>
                </div>
              </div>

              <div className="space-y-4">
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span className="checkbox-box"></span>
                  <span className="checkbox-text">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:text-primary/80 transition-colors focus-ring rounded px-1">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-primary hover:text-primary/80 transition-colors focus-ring rounded px-1">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="auth-button text-white"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>

              <div className="text-center">
                <span className="text-white/60">Already have an account? </span>
                <Link 
                  to="/auth/login" 
                  className="text-primary hover:text-primary/80 transition-colors font-semibold focus-ring rounded px-1"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};