import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Map as MapIcon,
  Bell,
  MessageSquare,
  Navigation,
  AlertTriangle,
  Construction,
  Waves,
  Car } from
'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { mockIncidents, Incident, IncidentType, Severity } from '../data/mockData';
import { fetchIncidents } from '../utils/api';
const severityColors: Record<Severity, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  major: 'bg-orange-100 text-orange-700 border-orange-200',
  moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  minor: 'bg-green-100 text-green-700 border-green-200'
};
const typeIcons: Record<IncidentType, React.ElementType> = {
  accident: AlertTriangle,
  construction: Construction,
  flood: Waves,
  congestion: Car
};
export function HomePage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);

  useEffect(() => {
    fetchIncidents()
      .then((data) => { if (data.length > 0) setIncidents(data); })
      .catch(() => { /* keep mock data on error */ });
  }, []);

  const recentAlerts = incidents.slice(0, 3);
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    show: {
      opacity: 1,
      y: 0
    }
  };
  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{
          opacity: 0,
          y: -20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="text-center py-12 md:py-20">
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          {t('home.hero.title')}
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
          {t('home.hero.subtitle')}
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 rounded-2xl border-0 ring-1 ring-slate-200 shadow-sm text-slate-900 bg-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-600 sm:text-lg transition-shadow hover:shadow-md"
            placeholder={t('home.search.placeholder')}
            onClick={() => navigate('/chat')} />
          
          <div className="absolute inset-y-0 right-2 flex items-center">
            <button
              onClick={() => navigate('/chat')}
              className="bg-cyan-600 text-white p-2 rounded-xl hover:bg-cyan-700 transition-colors shadow-sm">
              
              <Navigation size={20} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        
        {[
        {
          icon: MessageSquare,
          title: t('home.action.traffic.title'),
          desc: t('home.action.traffic.desc'),
          to: '/chat',
          color: 'text-blue-600',
          bg: 'bg-blue-50'
        },
        {
          icon: MapIcon,
          title: t('home.action.map.title'),
          desc: t('home.action.map.desc'),
          to: '/map',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50'
        },
        {
          icon: Bell,
          title: t('home.action.alerts.title'),
          desc: t('home.action.alerts.desc'),
          to: '/alerts',
          color: 'text-orange-600',
          bg: 'bg-orange-50'
        },
        {
          icon: Navigation,
          title: t('home.action.advice.title'),
          desc: t('home.action.advice.desc'),
          to: '/chat',
          color: 'text-purple-600',
          bg: 'bg-purple-50'
        }].
        map((action, idx) =>
        <motion.div key={idx} variants={itemVariants}>
            <button
            onClick={() => navigate(action.to)}
            className="w-full text-left bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all group h-full flex flex-col">
            
              <div
              className={`${action.bg} ${action.color} p-3 rounded-xl inline-flex mb-4 group-hover:scale-110 transition-transform`}>
              
                <action.icon size={24} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2">
                {action.desc}
              </p>
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Recent Alerts */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {t('home.recent_alerts')}
          </h2>
          <button
            onClick={() => navigate('/alerts')}
            className="text-cyan-600 font-medium hover:text-cyan-700 text-sm">
            
            {t('home.view_all')} &rarr;
          </button>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-3">
          
          {recentAlerts.map((incident) => {
            const Icon = typeIcons[incident.type];
            return (
              <motion.div
                key={incident.id}
                variants={itemVariants}
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col">
                
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                      <Icon size={20} />
                    </div>
                    <span className="font-medium text-slate-900">
                      {t(`type.${incident.type}`)}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${severityColors[incident.severity]}`}>
                    
                    {t(`severity.${incident.severity}`)}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">
                  {incident.location[language]}
                </h4>
                <p className="text-sm text-slate-600 mb-4 flex-grow">
                  {incident.description[language]}
                </p>
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>{incident.timestamp}</span>
                  <span>
                    {t('alerts.clearance')} {incident.clearanceTime}
                  </span>
                </div>
              </motion.div>);

          })}
        </motion.div>
      </div>
    </div>);

}