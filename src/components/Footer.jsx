'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram, faLinkedinIn, faGithub, faTiktok } from '@fortawesome/free-brands-svg-icons'

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" }
]

const socialLinks = [
  { 
    href: "https://instagram.com/yourhandle", 
    icon: faInstagram,
    label: "Instagram",
    color: "hover:text-pink-500"
  },
  { 
    href: "https://linkedin.com/in/yourprofile", 
    icon: faLinkedinIn,
    label: "LinkedIn",
    color: "hover:text-blue-600"
  },
  { 
    href: "https://github.com/yourusername", 
    icon: faGithub,
    label: "GitHub",
    color: "hover:text-white"
  },
  { 
    href: "https://tiktok.com/@yourusername", 
    icon: faTiktok,
    label: "TikTok",
    color: "hover:text-cyan-400"
  }
]

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-zinc-900/80 border-t border-zinc-800">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Logo and Description */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <img 
                src="/images/Logo.png" 
                alt="Cylia Tech Logo" 
                className="h-12 mb-4"
              />
              <p className="text-zinc-400 max-w-xs">
                Building responsive web applications and digital experiences that combine functionality with aesthetic appeal.
              </p>
            </motion.div>
          </div>
          
          {/* Navigation Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h4 className="text-xl font-semibold text-white mb-6">Navigation</h4>
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link, index) => (
                <Link 
                  key={index}
                  href={link.href}
                  className="text-zinc-400 hover:text-sky-400 transition duration-300 transform hover:translate-x-1 flex items-center"
                >
                  <span className="mr-2 text-xs text-sky-500">&#9642;</span>
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
          
          {/* Social Media */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h4 className="text-xl font-semibold text-white mb-6">Connect</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 transition-all duration-300 hover:scale-110 ${social.color}`}
                >
                  <FontAwesomeIcon icon={social.icon} />
                </a>
              ))}
            </div>
            <p className="text-zinc-500 mt-6 text-sm">
              Feel free to reach out for collaborations or just to say hello!
            </p>
          </motion.div>
        </div>
        
        {/* Copyright */}
        <div className="pt-8 mt-8 border-t border-zinc-800/50 text-center">
          <p className="text-zinc-500 text-sm">
            &copy; {currentYear} Muhamad Marsa Nur Jaman. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}