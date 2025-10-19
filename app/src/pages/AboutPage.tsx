import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { FloatingNav } from '@/components/ui/floating-navbar';
import { Home, Info, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Target, Users, Sparkles, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      <FloatingNav navItems={navItems} />
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20" />
      
      {/* Animated background lines */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-12 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 flex items-center justify-center">
                <Heart className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About Docitup</h1>
                <p className="text-xl text-gray-400 max-w-2xl">
                  Your private canvas for documenting life, achieving goals, and connecting with a global community
                </p>
              </div>
            </div>
          </div>

          {/* Mission */}
          <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl mb-8">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    Docitup was born from a simple belief: everyone deserves a private space to document their journey, 
                    reflect on their experiences, and grow. We're building a platform that puts your privacy first while 
                    enabling meaningful connections with a global community of like-minded individuals.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Values */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Privacy First</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Your data is yours. We encrypt everything, never sell your information, and give you complete control over what you share.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Community Driven</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Connect with people worldwide who share your passions, support your goals, and inspire your journey.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Beautiful Design</h3>
                    <p className="text-gray-300 leading-relaxed">
                      We believe in creating experiences that are not just functional, but delightful. Every interaction is crafted with care.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Always Improving</h3>
                    <p className="text-gray-300 leading-relaxed">
                      We're constantly listening to our community and evolving the platform to better serve your needs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl mb-8">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl font-bold text-white mb-6">What Makes Us Different</h2>
              <div className="space-y-6 text-gray-300">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Complete Privacy Control</h3>
                  <p className="leading-relaxed">
                    Unlike other platforms, you decide what's private and what's public. Your journal entries stay private by default, 
                    while you can choose to share goals and achievements with the community.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Ads, No Tracking</h3>
                  <p className="leading-relaxed">
                    We don't sell your data or show you ads. Our business model is built on providing value, not exploiting your attention.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Global Community</h3>
                  <p className="leading-relaxed">
                    Connect with people from around the world who share your interests, support your goals, and celebrate your achievements.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Rich Documentation</h3>
                  <p className="leading-relaxed">
                    Document your life with text, images, and media. Organize with tags, track your mood, and reflect on your journey.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl border-purple-500/30 shadow-2xl">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Join Our Community</h2>
              <p className="text-gray-300 mb-6 text-lg">
                Start documenting your journey today and connect with thousands of users worldwide
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Link to="/register">Get Started Free</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

