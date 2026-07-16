'use client'

import { motion } from "framer-motion"

export default function ParseRevealHero() {
  return (
    <div className="grid lg:grid-cols-2 gap-12 items-center py-24">
      <div className="space-y-8">
        <h1 className="font-serif text-5xl lg:text-7xl leading-tight font-medium text-ink dark:text-paper">
          Turn a resume into a <span className="text-highlighter italic">hiring signal.</span>
        </h1>
        <p className="text-xl text-ink-text dark:text-slate-300 max-w-lg">
          Sift replaces the noise of traditional ATS software with an AI-native pipeline that finds the exact match you need.
        </p>
        <div className="flex flex-wrap gap-4">
          <a href="/register?role=corporate" className="bg-ink text-paper dark:bg-paper dark:text-ink px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity">
            Start Hiring
          </a>
          <a href="/register?role=student" className="border border-ink/20 dark:border-paper/20 px-6 py-3 rounded-md font-medium hover:bg-ink/5 dark:hover:bg-paper/5 transition-colors">
            Find a Job
          </a>
        </div>
      </div>

      <div className="relative h-[500px] w-full flex items-center justify-center">
        {/* Document Side */}
        <motion.div 
          className="absolute left-0 lg:left-12 bg-white dark:bg-slate-100 text-ink shadow-xl rounded-lg p-6 w-[300px] h-[400px] z-10 origin-bottom-left"
          initial={{ rotate: -5, x: 0 }}
          animate={{ rotate: -15, x: -50, scale: 0.95 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
        >
          <div className="space-y-4">
            <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
            <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
            <div className="space-y-2 pt-6">
              <div className="h-2 w-full bg-slate-100 rounded"></div>
              <div className="h-2 w-full bg-slate-100 rounded"></div>
              <div className="h-2 w-5/6 bg-slate-100 rounded"></div>
            </div>
            <div className="space-y-2 pt-4">
              <div className="h-2 w-full bg-slate-100 rounded"></div>
              <div className="h-2 w-full bg-slate-100 rounded"></div>
              <div className="h-2 w-4/6 bg-slate-100 rounded"></div>
            </div>
          </div>
        </motion.div>

        {/* Data Side */}
        <motion.div 
          className="absolute right-0 lg:right-12 bg-paper dark:bg-ink border border-ink/10 dark:border-paper/10 shadow-lg rounded-xl p-6 w-[320px] z-20"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="font-sans font-semibold text-lg">Alex Chen</h3>
              <p className="text-sm text-slate-500">Frontend Engineer</p>
            </div>
            <div className="relative w-12 h-12">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  className="text-highlighter"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 4 }}
                  transition={{ duration: 2, delay: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-xs font-semibold">96</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Matched Skills</p>
              <div className="flex flex-wrap gap-2">
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }} className="px-2 py-1 bg-signal/10 text-signal text-xs font-mono rounded">React</motion.span>
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.0 }} className="px-2 py-1 bg-signal/10 text-signal text-xs font-mono rounded">TypeScript</motion.span>
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 }} className="px-2 py-1 bg-signal/10 text-signal text-xs font-mono rounded">Next.js</motion.span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Experience</p>
              <p className="font-mono text-sm">4 Years</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
