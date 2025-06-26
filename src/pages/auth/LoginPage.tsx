import type { FC } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, AlertCircle, Eye, EyeOff, AtSign, SquareAsterisk } from 'lucide-react';
import { motion } from 'framer-motion';
import { TextInput } from 'flowbite-react';
import { BorderBottomBeam } from '../../components/ui/BorderBottomBeam';
import { SwitchRevealHeading } from '../../components/ui/SwitchRevealHeading';
import { useAuthStore } from '../../store/auth';

const resumeTexts = [
  'Revolution',
  'Evolution',
  'Transformation',
  'Movement',
  'Reinvention',
  'Upgrade',
  'Reimagining',
  'Breakthrough',
];

export const LoginPage: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await login(email, password);
    
    if (result.error) {
      setError(result.error);
    } else {
      // Successfully logged in - navigate to dashboard
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
              <SwitchRevealHeading
                headingText="Join the Resume"
                auroraTexts={resumeTexts}
                className="text-5xl font-bold leading-tight"
                pauseDuration={6000}
                fadeDuration={0.3}
                auroraHueSkew={[180, 210, 240, 270, 300]}
              />
              <p className="text-xl text-white/80 leading-relaxed">
                Your intelligent resume agents are waiting. Sign in to continue building 
                AI-powered professional profiles that work for you 24/7.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-white/60">Active Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">AI-Powered</div>
                <div className="text-sm text-white/60">Intelligence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">Smart</div>
                <div className="text-sm text-white/60">Matching</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Login Form */}
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
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-white/70">Enter your credentials to access your account</p>
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
                        color="auth"
                        sizing="md"
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
                        autoComplete="current-password"
                        placeholder="Password"
                        color="auth"
                        sizing="md"
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

              <div className="flex justify-end">
                <Link 
                  to="/auth/forgot-password" 
                  className="text-sm text-primary hover:text-primary/80 transition-colors focus-ring rounded px-1"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="auth-button text-white"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="text-center">
                <span className="text-white/60">Don't have an account? </span>
                <Link 
                  to="/auth/signup" 
                  className="text-primary hover:text-primary/80 transition-colors font-semibold focus-ring rounded px-1"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};