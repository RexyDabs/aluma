'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Shield, Eye, EyeOff, ArrowLeft, CheckCircle, Zap, Users, Settings } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const demoCredentials = [
    { 
      role: 'Admin', 
      email: 'alice.admin@example.com', 
      password: 'demo123', 
      description: 'Full system access with all permissions',
      icon: <Settings className="h-5 w-5" />,
      color: 'from-red-500 to-red-600',
      features: ['User Management', 'System Settings', 'Financial Reports', 'All Data Access']
    },
    { 
      role: 'Manager', 
      email: 'mark.manager@example.com', 
      password: 'demo123', 
      description: 'Team and project management capabilities',
      icon: <Users className="h-5 w-5" />,
      color: 'from-purple-500 to-purple-600',
      features: ['Team Management', 'Project Oversight', 'Client Communication', 'Resource Planning']
    },
    { 
      role: 'Tradie', 
      email: 'tina.tradie@example.com', 
      password: 'demo123', 
      description: 'Job execution and task management',
      icon: <Zap className="h-5 w-5" />,
      color: 'from-blue-500 to-blue-600',
      features: ['Job Execution', 'Task Management', 'Time Tracking', 'Progress Updates']
    }
  ];

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin(credential: typeof demoCredentials[0]) {
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credential.email,
        password: credential.password,
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleDevBypass() {
    setLoading(true);
    setError('');

    try {
      // For development, we'll create a mock user session
      // In production, this should be removed
      const mockUser = {
        id: 'dev-user-id',
        email: 'dev@example.com',
        role: 'admin',
        full_name: 'Development User'
      };

      // Store in localStorage for development
      localStorage.setItem('dev-user', JSON.stringify(mockUser));
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Development bypass failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl mr-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Aluma
            </h1>
          </div>
          <p className="text-xl text-gray-600">Sign in to your account</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Login Form */}
          <Card className="card-hover border-0 shadow-medium bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription className="text-base">
                Enter your credentials to access the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="form-input pr-12"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full btn-primary py-3 text-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {/* Development Bypass */}
              {process.env.NODE_ENV === 'development' && (
                <div className="pt-6 border-t border-gray-200">
                  <Card className="border-orange-200 bg-orange-50/50">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <Badge className="bg-orange-100 text-orange-800 mb-3 border border-orange-200">
                          Development Only
                        </Badge>
                        <p className="text-sm text-gray-600 mb-4">
                          Skip authentication for development and testing
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDevBypass}
                          disabled={loading}
                          className="border-orange-300 text-orange-700 hover:bg-orange-100 hover:border-orange-400"
                        >
                          Dev Bypass
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Try Demo Accounts
              </h3>
              <p className="text-gray-600">
                Experience the system from different user perspectives
              </p>
            </div>
            
            <div className="space-y-4">
              {demoCredentials.map((cred, index) => (
                <Card key={index} className="card-hover border-0 shadow-soft bg-white/80 backdrop-blur-sm overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${cred.color}`}></div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 bg-gradient-to-r ${cred.color} rounded-lg`}>
                          <div className="text-white">{cred.icon}</div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-gray-900">{cred.role}</h4>
                          <p className="text-sm text-gray-600">{cred.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-700 mb-1">Email:</div>
                        <div className="text-gray-600 font-mono bg-gray-50 p-2 rounded text-xs border">
                          {cred.email}
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-700 mb-1">Password:</div>
                        <div className="text-gray-600 font-mono bg-gray-50 p-2 rounded text-xs border">
                          {cred.password}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="font-medium text-gray-700 text-sm">Key Features:</div>
                      <ul className="space-y-1">
                        {cred.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button 
                      className={`w-full bg-gradient-to-r ${cred.color} hover:shadow-medium transform hover:-translate-y-0.5 transition-all duration-200`}
                      onClick={() => handleDemoLogin(cred)}
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : `Login as ${cred.role}`}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            Don't have an account?{' '}
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact us for access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 