import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BackgroundLines } from '@/components/ui/background-lines';
import { Highlight } from '@/components/ui/hero-highlight';
import { WobbleCard } from '@/components/ui/wobble-card';
import { FloatingNav } from '@/components/ui/floating-navbar';
import { Globe } from '@/components/ui/globe';
import { Banner } from '@/components/ui/banner';
import { BookOpen, Target, Users, Lock, Zap, Brain, Home, Info, Mail, Globe as GlobeIcon, MessageCircle, Clock } from 'lucide-react';

export default function LandingPage() {
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

  return (
    <div className="min-h-screen bg-black">
      {/* <SmoothCursor /> */}
      <FloatingNav navItems={navItems} />
      {/* Hero Section */}
      <BackgroundLines className="relative overflow-hidden min-h-[600px] flex items-center justify-center">
        <div className="relative z-20 container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="relative z-20 flex justify-center mb-4">
              <Banner text="Introducing Docitup" href="#features" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight relative z-20 py-2 md:py-10">
              <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                <Highlight className="text-white">Docitup</Highlight>, <br /> Your Private Canvas.
              </span>
            </h1>
            <p className="max-w-xl mx-auto text-sm md:text-lg text-gray-300 text-center relative z-20">
              Get the best advices from our experts, including expert artists,
              painters, marathon enthusiasts and RDX, totally free.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8 relative z-20">
              <Link to="/register">
                <button className="group relative px-10 py-4 text-base font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95">
                  {/* Gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_100%] animate-gradient"></div>
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 blur-xl group-hover:opacity-70 transition-opacity duration-300"></div>
                  
                  {/* Border glow */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    animation: 'shimmer 2s infinite'
                  }}></div>
                  
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started Free
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </Link>
              <Link to="/login">
                <button className="group relative px-10 py-4 text-base font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95">
                  {/* Glass background */}
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20"></div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  
                  <span className="relative z-10 flex items-center gap-2">
                    Sign In
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </BackgroundLines>

      {/* Globe & Connection Section */}
      <div className="relative min-h-[600px] flex items-center justify-center bg-black overflow-hidden">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Globe */}
            <div className="relative h-[400px] md:h-[500px] w-full">
              <Globe className="relative" />
            </div>

            {/* Right Side - Description */}
            <div className="space-y-6 text-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <GlobeIcon className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Connect with People Around the World
                </h2>
              </div>
              <p className="text-lg text-gray-400 leading-relaxed">
                Docitup isn't just a personal journal—it's a global community of individuals sharing their journeys, 
                supporting each other's goals, and connecting across borders.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-200 mb-1">Share Your Goals</h3>
                    <p className="text-gray-500">
                      Make your goals public and inspire others while keeping your private thoughts secure.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-200 mb-1">Global Community</h3>
                    <p className="text-gray-500">
                      Connect with like-minded individuals from every corner of the world, sharing experiences and wisdom.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-200 mb-1">Privacy First</h3>
                    <p className="text-gray-500">
                      You control what you share. Your private entries remain yours, while you choose what to make public.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100">
                  <Link to="/register">Join the Community</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-20 md:py-32 bg-black">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
            Everything you need to document your life
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A comprehensive platform designed for privacy, growth, and meaningful connections
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <WobbleCard>
            <Card className="glass-card hover-lift group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 smooth-transition">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Rich Documentation</CardTitle>
                <CardDescription className="text-base">
                  Create beautiful journal entries with text, photos, videos, and more. Organize with tags, categories, and folders.
                </CardDescription>
              </CardHeader>
            </Card>
          </WobbleCard>

          <WobbleCard>
            <Card className="glass-card hover-lift group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 smooth-transition">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">AI-Powered Insights</CardTitle>
                <CardDescription className="text-base">
                  Get sentiment analysis, automatic summaries, personalized prompts, and ask your journal questions.
                </CardDescription>
              </CardHeader>
            </Card>
          </WobbleCard>

          <WobbleCard>
            <Card className="glass-card hover-lift group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 smooth-transition">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Goal Tracking</CardTitle>
                <CardDescription className="text-base">
                  Set, track, and achieve your goals with progress visualization, action steps, and habit tracking.
                </CardDescription>
              </CardHeader>
            </Card>
          </WobbleCard>

          <WobbleCard>
            <Card className="glass-card hover-lift group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 smooth-transition">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Community Support</CardTitle>
                <CardDescription className="text-base">
                  Connect with like-minded individuals through public goals while keeping your private entries secure.
                </CardDescription>
              </CardHeader>
            </Card>
          </WobbleCard>

          <WobbleCard>
            <Card className="glass-card hover-lift group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 smooth-transition">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Privacy First</CardTitle>
                <CardDescription className="text-base">
                  Your data is encrypted and private. You control what you share. No ads, no tracking, no exploitation.
                </CardDescription>
              </CardHeader>
            </Card>
          </WobbleCard>

          <WobbleCard>
            <Card className="glass-card hover-lift group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 smooth-transition">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Distraction-Free</CardTitle>
                <CardDescription className="text-base">
                  A clean, minimal interface focused on your journey. No noise, no external validation pressure.
                </CardDescription>
              </CardHeader>
            </Card>
          </WobbleCard>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="container mx-auto px-4 py-20 md:py-32 bg-black">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="glass-card border-2 border-primary/20 bg-zinc-900/80 hover:border-primary/40 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-200 mb-2">Email Support</h3>
                    <p className="text-gray-400 mb-3">
                      Send us an email and we'll get back to you as soon as possible.
                    </p>
                    <a 
                      href="mailto:support@docitup.com" 
                      className="text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-2"
                    >
                      support@docitup.com
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-2 border-primary/20 bg-zinc-900/80 hover:border-primary/40 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-200 mb-2">Response Time</h3>
                    <p className="text-gray-400 mb-3">
                      We typically respond to all inquiries within 24 hours during business days.
                    </p>
                    <p className="text-sm text-gray-500">
                      Monday - Friday, 9 AM - 6 PM EST
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-2 border-primary/20 bg-zinc-900/80">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-200 mb-4">Need Help?</h3>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Whether you have a question about features, need technical support, or want to share feedback, 
                we're here to help. Reach out and let's make Docitup better together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  <a href="mailto:support@docitup.com">Send us an Email</a>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-primary/30 text-gray-200 hover:bg-primary/10">
                  <Link to="/about">Learn More About Us</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 mt-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <p className="font-semibold text-gray-200 mb-2 text-lg">Docitup</p>
              <p className="text-sm text-gray-400">Your Private Canvas for Life</p>
            </div>
            <div>
              <p className="font-semibold text-gray-200 mb-3">Legal</p>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <Link to="/privacy-policy" className="hover:text-gray-200 smooth-transition">Privacy Policy</Link>
                <Link to="/terms-of-service" className="hover:text-gray-200 smooth-transition">Terms of Service</Link>
                <Link to="/about" className="hover:text-gray-200 smooth-transition">About</Link>
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-200 mb-3">Account</p>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <Link to="/login" className="hover:text-gray-200 smooth-transition">Sign In</Link>
                <Link to="/register" className="hover:text-gray-200 smooth-transition">Sign Up</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Docitup. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

