import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { FloatingNav } from '@/components/ui/floating-navbar';
import { Home, Info, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Privacy Policy</h1>
                <p className="text-gray-400">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
            <CardContent className="p-8 md:p-12 space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-purple-400" />
                  Introduction
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  At Docitup, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this policy carefully to understand our practices regarding your personal data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-purple-400" />
                  Information We Collect
                </h2>
                <div className="space-y-4 text-gray-300">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Personal Information</h3>
                    <p className="leading-relaxed">
                      We collect information that you provide directly to us, including:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                      <li>Email address and username</li>
                      <li>Full name (optional)</li>
                      <li>Profile information and preferences</li>
                      <li>Journal entries and content you create</li>
                      <li>Goals and progress tracking data</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Usage Information</h3>
                    <p className="leading-relaxed">
                      We automatically collect certain information when you use our platform:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                      <li>Device information and browser type</li>
                      <li>IP address and location data</li>
                      <li>Usage patterns and feature interactions</li>
                      <li>Log files and error reports</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-purple-400" />
                  How We Use Your Information
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">We use the information we collect to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process your registration and manage your account</li>
                    <li>Send you important updates and notifications</li>
                    <li>Respond to your inquiries and provide customer support</li>
                    <li>Detect, prevent, and address technical issues</li>
                    <li>Ensure platform security and prevent fraud</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-purple-400" />
                  Data Security
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  We implement industry-standard security measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside mt-4 space-y-2 ml-4 text-gray-300">
                  <li>End-to-end encryption for sensitive data</li>
                  <li>Secure cloud storage with regular backups</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication protocols</li>
                  <li>Employee training on data protection</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Your Privacy Rights</h2>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">You have the right to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Access and review your personal data</li>
                    <li>Request correction of inaccurate information</li>
                    <li>Request deletion of your account and data</li>
                    <li>Opt-out of certain data collection practices</li>
                    <li>Export your data in a portable format</li>
                    <li>Withdraw consent for data processing</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Third-Party Services</h2>
                <p className="text-gray-300 leading-relaxed">
                  We may use third-party services to help us operate our platform and provide services to you. These services may have access to your information only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
                <p className="text-gray-300 leading-relaxed">
                  Our platform is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Changes to This Policy</h2>
                <p className="text-gray-300 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
                <p className="text-gray-300 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <p className="text-white font-semibold mb-1">Email:</p>
                  <p className="text-purple-400">privacy@docitup.com</p>
                </div>
              </section>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

