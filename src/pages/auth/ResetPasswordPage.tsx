import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { TextInput, FloatingLabel } from 'flowbite-react';
import { BorderBottomBeam } from '../../components/ui/BorderBottomBeam';
import { supabase } from '../../lib/supabase';

export const ResetPasswordPage: FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check if we have the required tokens
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  useEffect(() => {
    // If we have tokens, set the session
    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
  }, [accessToken, refreshToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If no tokens are present, show error
  if (!accessToken || !refreshToken) {
    return (
      <div className="min-h-screen auth-background flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="glass-card rounded-3xl p-8 glow-secondary text-center">
            <div className="bg-red-500/20 rounded-full p-4 w-fit mx-auto mb-4">
              <AlertCircle className="h-12 w-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h2>
            <p className="text-white/70 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link to="/auth/forgot-password">
              <button className="auth-button text-white">
                Request New Reset Link
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                  Password
                  <span className="block gradient-primary bg-clip-text text-transparent">
                    Updated!
                  </span>
                </h2>
                <p className="text-xl text-white/80 leading-relaxed">
                  Your password has been successfully updated. You're now being 
                  redirected to your dashboard to continue with your AI-powered resume agents.
                </p>
              </div>

              <div className="space-y-4 pt-8">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white/80">Password successfully updated</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white/80">Account security enhanced</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white/80">Redirecting to dashboard...</span>
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
              <div className="text-center">
                <div className="bg-green-500/20 rounded-full p-4 w-fit mx-auto mb-4">
                  <CheckCircle className="h-12 w-12 text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Success!</h2>
                <p className="text-white/70 mb-6">Your password has been updated</p>
                
                <div className="flex items-center justify-center space-x-2 text-white/60">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>Redirecting to dashboard...</span>
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
                Create New
                <span className="block gradient-primary bg-clip-text text-transparent">
                  Password
                </span>
              </h2>
              <p className="text-xl text-white/80 leading-relaxed">
                Choose a strong, secure password for your account. Make sure it's something 
                you'll remember but others can't guess.
              </p>
            </div>

            <div className="space-y-4 pt-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-white/80">Minimum 6 characters required</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-white/80">Use a mix of letters and numbers</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-white/80">Keep it secure and memorable</span>
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
              <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
              <p className="text-white/70">Enter your new password below</p>
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
                {/* Password Input */}
                <div className="relative">
                  <BorderBottomBeam 
                    play={passwordFocused}
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
                        disabled={isLoading}
                        autoComplete="new-password"
                        placeholder=" "
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
                    <FloatingLabel
                      htmlFor="password"
                      value="New Password (min. 6 characters)"
                      variant="standard"
                      sizing="md"
                      className="absolute text-base text-white/60 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                    />
                  </BorderBottomBeam>
                </div>

                {/* Confirm Password Input */}
                <div className="relative">
                  <BorderBottomBeam 
                    play={confirmPasswordFocused}
                    colorFrom="#6366f1"
                    colorTo="#ec4899"
                    duration={2}
                    size={60}
                  >
                    <div className="relative">
                      <TextInput
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setConfirmPasswordFocused(true)}
                        onBlur={() => setConfirmPasswordFocused(false)}
                        disabled={isLoading}
                        autoComplete="new-password"
                        placeholder=" "
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="password-toggle"
                        disabled={isLoading}
                        tabIndex={0}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <FloatingLabel
                      htmlFor="confirmPassword"
                      value="Confirm New Password"
                      variant="standard"
                      sizing="md"
                      className="absolute text-base text-white/60 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                    />
                  </BorderBottomBeam>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="auth-button text-white"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Updating Password...</span>
                  </div>
                ) : (
                  'Update Password'
                )}
              </button>

              <div className="text-center">
                <Link 
                  to="/auth/login" 
                  className="text-white/70 hover:text-white transition-colors focus-ring rounded px-1"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};