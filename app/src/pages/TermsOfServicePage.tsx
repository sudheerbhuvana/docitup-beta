import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { FloatingNav } from '@/components/ui/floating-navbar';
import { Home, Info, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TermsOfServicePage() {
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
                <Scale className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Terms of Service</h1>
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
                  Acceptance of Terms
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  By accessing and using Docitup, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-purple-400" />
                  Use License
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">Permission is granted to temporarily use Docitup for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial purpose or for any public display</li>
                    <li>Attempt to reverse engineer any software contained on Docitup</li>
                    <li>Remove any copyright or other proprietary notations from the materials</li>
                    <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-purple-400" />
                  User Accounts
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Maintaining the security of your account and password</li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of any unauthorized use</li>
                    <li>Ensuring that your username is unique and appropriate</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">User Content</h2>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">You retain ownership of all content you post, upload, or otherwise make available on Docitup. By posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content solely for the purpose of operating and providing our services.</p>
                  <p className="leading-relaxed">You agree not to post content that:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Is illegal, harmful, or violates any laws</li>
                    <li>Infringes on the rights of others</li>
                    <li>Contains hate speech, harassment, or discrimination</li>
                    <li>Is spam, misleading, or fraudulent</li>
                    <li>Contains viruses or malicious code</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Privacy and Data</h2>
                <p className="text-gray-300 leading-relaxed">
                  Your use of Docitup is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding the collection and use of your personal information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Prohibited Uses</h2>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">You may not use Docitup:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>In any way that violates any applicable law or regulation</li>
                    <li>To transmit, or procure the sending of, any advertising or promotional material</li>
                    <li>To impersonate or attempt to impersonate another user or person</li>
                    <li>In any manner that could disable, overburden, damage, or impair the platform</li>
                    <li>To engage in any other conduct that restricts or inhibits anyone's use of the platform</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Termination</h2>
                <p className="text-gray-300 leading-relaxed">
                  We may terminate or suspend your account and bar access to the platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the platform will cease immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Disclaimer</h2>
                <p className="text-gray-300 leading-relaxed">
                  The materials on Docitup are provided on an 'as is' basis. Docitup makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Limitations of Liability</h2>
                <p className="text-gray-300 leading-relaxed">
                  In no event shall Docitup or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Docitup, even if Docitup or a Docitup authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Changes to Terms</h2>
                <p className="text-gray-300 leading-relaxed">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <p className="text-white font-semibold mb-1">Email:</p>
                  <p className="text-purple-400">legal@docitup.com</p>
                </div>
              </section>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

