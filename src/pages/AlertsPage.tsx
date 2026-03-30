import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Construction,
  Waves,
  Car,
  Clock,
  MapPin,
  Filter } from
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
export function AlertsPage() {
  const { t, language } = useLanguage();
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<IncidentType | 'all'>('all');

  useEffect(() => {
    fetchIncidents()
      .then((data) => { if (data.length > 0) setIncidents(data); })
      .catch(() => { /* keep mock data on error */ });
  }, []);

  const filteredIncidents = incidents.filter((incident) => {
    const matchSeverity =
    severityFilter === 'all' || incident.severity === severityFilter;
    const matchType = typeFilter === 'all' || incident.type === typeFilter;
    return matchSeverity && matchType;
  });
  const severities: (Severity | 'all')[] = [
  'all',
  'critical',
  'major',
  'moderate',
  'minor'];

  const types: (IncidentType | 'all')[] = [
  'all',
  'accident',
  'construction',
  'flood',
  'congestion'];

  const containerVariants = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          {t('alerts.title')}
        </h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-slate-700 font-medium mb-2">
            <Filter size={18} />
            <span>Filters</span>
          </div>

          <div className="space-y-3">
            {/* Severity Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-500 w-20">
                {t('alerts.filter.severity')}:
              </span>
              {severities.map((sev) =>
              <button
                key={`sev-${sev}`}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${severityFilter === sev ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                
                  {sev === 'all' ?
                t('alerts.filter.all') :
                t(`severity.${sev}`)}
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-500 w-20">
                {t('alerts.filter.type')}:
              </span>
              {types.map((type) =>
              <button
                key={`type-${type}`}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${typeFilter === type ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                
                  {type === 'all' ? t('alerts.filter.all') : t(`type.${type}`)}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2">
        
        {filteredIncidents.length > 0 ?
        filteredIncidents.map((incident) => {
          const Icon = typeIcons[incident.type];
          return (
            <motion.div
              key={incident.id}
              variants={itemVariants}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div
                    className={`p-2 rounded-xl ${incident.type === 'accident' ? 'bg-red-50 text-red-600' : incident.type === 'construction' ? 'bg-orange-50 text-orange-600' : incident.type === 'flood' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                    
                      <Icon size={24} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {t(`type.${incident.type}`)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {incident.timestamp}
                      </span>
                    </div>
                  </div>
                  <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border ${severityColors[incident.severity]}`}>
                  
                    {t(`severity.${incident.severity}`)}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-start gap-2 text-slate-800 font-medium">
                    <MapPin
                    size={18}
                    className="text-slate-400 mt-0.5 flex-shrink-0" />
                  
                    <span>{incident.location[language]}</span>
                  </div>
                  <p className="text-slate-600 text-sm pl-6">
                    {incident.description[language]}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Clock size={16} className="text-slate-400" />
                  <span>
                    {t('alerts.clearance')}{' '}
                    <span className="text-slate-700">
                      {incident.clearanceTime}
                    </span>
                  </span>
                </div>
              </motion.div>);

        }) :

        <div className="col-span-full py-12 text-center text-slate-500">
            No alerts match your filters.
          </div>
        }
      </motion.div>
    </div>);

}