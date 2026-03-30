import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import {
  MapPin,
  Menu,
  X,
  MessageSquare,
  Map as MapIcon,
  Bell,
  Home } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'th' : 'en');
  };
  const navLinks = [
  {
    to: '/',
    icon: Home,
    label: t('nav.home')
  },
  {
    to: '/chat',
    icon: MessageSquare,
    label: t('nav.chat')
  },
  {
    to: '/map',
    icon: MapIcon,
    label: t('nav.map')
  },
  {
    to: '/alerts',
    icon: Bell,
    label: t('nav.alerts')
  }];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="bg-cyan-600 text-white p-2 rounded-xl group-hover:bg-cyan-700 transition-colors">
              <MapPin size={20} className="animate-pulse" />
            </div>
            <span className="font-bold text-lg text-slate-900 hidden sm:block">
              {t('app.title')}
            </span>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
              `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
              }>
              
                <link.icon size={16} />
                {link.label}
              </NavLink>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200 shadow-sm hover:bg-slate-200 transition-colors">
              
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${language === 'en' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500'}`}>
                
                EN
              </span>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${language === 'th' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500'}`}>
                
                TH
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen &&
        <motion.div
          initial={{
            height: 0,
            opacity: 0
          }}
          animate={{
            height: 'auto',
            opacity: 1
          }}
          exit={{
            height: 0,
            opacity: 0
          }}
          className="md:hidden bg-white border-b border-slate-200 overflow-hidden">
          
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) =>
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50'}`
              }>
              
                  <link.icon size={20} />
                  {link.label}
                </NavLink>
            )}
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </header>);

}