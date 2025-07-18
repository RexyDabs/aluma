'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Building2, 
  Users, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Settings,
  ArrowRight,
  Shield,
  CheckCircle,
  Star,
  Zap,
  Target,
  BarChart3,
  Clock
} from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        router.push('/dashboard');
      }
    }
    
    checkAuth();
  }, [router]);

  const features = [
    {
      icon: <Target className="h-8 w-8" />,
      title: "Lead Management",
      description: "Track and manage potential clients from initial contact to conversion with intelligent scoring and automated follow-ups",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Job Management",
      description: "Organize projects with detailed task breakdowns, resource allocation, and real-time progress tracking",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Team Collaboration",
      description: "Assign tasks, track time, and coordinate with your team through integrated communication tools",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Smart Scheduling",
      description: "Plan and schedule jobs with AI-powered optimization and integrated calendar management",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Advanced Analytics",
      description: "Monitor performance with detailed reports, insights, and predictive analytics for better decision making",
      color: "from-red-500 to-red-600"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Role-Based Security",
      description: "Secure access control with customizable user permissions and enterprise-grade security",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  const stats = [
    { label: "Active Users", value: "500+", icon: <Users className="h-5 w-5" /> },
    { label: "Jobs Completed", value: "2,500+", icon: <CheckCircle className="h-5 w-5" /> },
    { label: "Success Rate", value: "98%", icon: <Star className="h-5 w-5" /> },
    { label: "Time Saved", value: "40hrs/week", icon: <Clock className="h-5 w-5" /> }
  ];

  const demoCredentials = [
    { 
      role: 'Admin', 
      email: 'alice.admin@example.com', 
      password: 'demo123', 
      description: 'Full system access with all permissions',
      color: 'from-red-500 to-red-600',
      features: ['User Management', 'System Settings', 'Financial Reports', 'All Data Access']
    },
    { 
      role: 'Manager', 
      email: 'mark.manager@example.com', 
      password: 'demo123', 
      description: 'Team and project management capabilities',
      color: 'from-purple-500 to-purple-600',
      features: ['Team Management', 'Project Oversight', 'Client Communication', 'Resource Planning']
    },
    { 
      role: 'Tradie', 
      email: 'tina.tradie@example.com', 
      password: 'demo123', 
      description: 'Job execution and task management',
      color: 'from-blue-500 to-blue-600',
      features: ['Job Execution', 'Task Management', 'Time Tracking', 'Progress Updates']
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Aluma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-soft border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Aluma
                </h1>
              </div>
              <Badge className="ml-4 bg-blue-100 text-blue-800 border border-blue-200">
                SaaS MVP
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/login')}
                className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              >
                Login
              </Button>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="btn-primary"
              >
                Try Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-800 border border-blue-200 px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              Built for Modern Trade Businesses
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Streamline Your
              <span className="text-gradient block"> Trade Business</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-10 leading-relaxed">
              Complete SaaS solution designed specifically for tradies and sole traders. 
              Manage leads, jobs, tasks, and team collaboration all in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button 
                size="lg" 
                onClick={() => router.push('/dashboard')}
                className="btn-primary text-lg px-8 py-4"
              >
                Start Free Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => router.push('/login')}
                className="btn-secondary text-lg px-8 py-4"
              >
                Login to Account
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg mx-auto mb-4">
                  <div className="text-white">{stat.icon}</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed specifically for trade businesses, 
              helping you work smarter, not harder.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover border-0 shadow-soft bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 bg-gradient-to-r ${feature.color} rounded-xl`}>
                      <div className="text-white">{feature.icon}</div>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Credentials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Experience Different User Roles
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Try the system from different perspectives to see how it adapts to various user needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {demoCredentials.map((cred, index) => (
              <Card key={index} className="card-hover border-0 shadow-soft bg-white overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${cred.color}`}></div>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl mb-2">{cred.role}</CardTitle>
                  <CardDescription className="text-base">
                    {cred.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="font-semibold text-gray-700 mb-1">Email:</div>
                      <div className="text-gray-600 font-mono bg-gray-50 p-2 rounded text-xs">{cred.email}</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold text-gray-700 mb-1">Password:</div>
                      <div className="text-gray-600 font-mono bg-gray-50 p-2 rounded text-xs">{cred.password}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-semibold text-gray-700 text-sm">Key Features:</div>
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
                    onClick={() => router.push('/login')}
                  >
                    Login as {cred.role}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join hundreds of trade businesses already using Aluma to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button 
              size="lg" 
              onClick={() => router.push('/dashboard')}
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 shadow-medium"
            >
              Start Free Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => router.push('/login')}
              className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4"
            >
              Login Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mr-3">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Aluma</h3>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Complete SaaS solution for trade businesses. Streamline operations, 
                manage teams, and grow your business with powerful tools designed for modern tradies.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <span className="text-sm font-semibold">T</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <span className="text-sm font-semibold">L</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <span className="text-sm font-semibold">G</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Aluma. Built with Next.js, Supabase, and Tailwind CSS.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
