'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Briefcase, TrendingUp, Clock } from 'lucide-react'
import { getDashboardData } from '@/app/actions/corporate'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { motion } from 'framer-motion'

export default function CorporateDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const dashboardData = await getDashboardData()
        setData(dashboardData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="p-8 flex justify-center items-center h-full">
      <div className="w-8 h-8 border-4 border-highlighter border-t-transparent rounded-full animate-spin" />
    </div>
  }

  // Aggregate stats
  const activeJobs = data?.jobs?.length || 0
  const totalApps = data?.applications?.length || 0
  
  // Funnel Data for the chart
  const statuses = ['applied', 'screening', 'shortlisted', 'interview', 'offer', 'hired', 'rejected']
  const funnelData = statuses.map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    count: data?.applications?.filter((a: any) => a.status === s).length || 0
  }))

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening with your hiring pipeline today.</p>
        </div>
        <Button className="bg-highlighter hover:bg-highlighter/90 text-ink-text font-bold gap-2 rounded-xl px-5 py-6">
          <Plus size={20} />
          Create New Job
        </Button>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={item}>
          <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 ring-1 ring-slate-100 dark:ring-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{activeJobs}</div>
              <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" /> +2 this month
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 ring-1 ring-slate-100 dark:ring-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalApps}</div>
              <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" /> +15% from last week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-none shadow-sm bg-gradient-to-br from-highlighter to-highlighter/80 text-ink-text">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Time to Hire</CardTitle>
              <Clock className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">14 days</div>
              <p className="text-xs text-blue-200 font-medium flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" /> 2 days faster
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-slate-100 dark:ring-zinc-800">
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Application stages across all active jobs</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="var(--color-highlighter)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-slate-100 dark:ring-zinc-800">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest pipeline updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data?.recentApplications?.length > 0 ? data.recentApplications.map((app: any, i: number) => (
                <div key={app.id} className="flex gap-4 items-start relative">
                  {i !== data.recentApplications.length - 1 && (
                    <div className="absolute top-8 left-4 w-px h-full bg-slate-200 dark:bg-zinc-800 -ml-px" />
                  )}
                  <div className="w-8 h-8 rounded-full bg-highlighter/20 text-highlighter flex items-center justify-center flex-shrink-0 relative z-10 ring-4 ring-paper dark:ring-ink">
                    <Users size={14} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-900 dark:text-white font-medium">
                      {app.student_profiles?.full_name} applied for <span className="font-semibold text-highlighter">{app.job_postings?.title}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      {new Date(app.applied_at).toLocaleDateString()}
                      <Badge variant="outline" className="text-[10px] py-0">{app.status}</Badge>
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-500">No recent activity.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-100 dark:ring-zinc-800">
        <CardHeader>
          <CardTitle>Active Job Postings</CardTitle>
          <CardDescription>Manage your current open roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {data?.jobs?.map((job: any) => (
              <div key={job.id} className="py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors -mx-6 px-6 rounded-lg cursor-pointer" onClick={() => window.location.href = `/corporate/jobs/${job.id}`}>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">{job.title}</h3>
                  <div className="flex gap-3 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Briefcase size={14} /> {job.employment_type}</span>
                    <span className="flex items-center gap-1">📍 {job.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-signal/20 text-signal hover:bg-signal/30 border-none">
                    {job.status}
                  </Badge>
                  <Link href={`/corporate/jobs/${job.id}`}>
                    <Button variant="ghost" size="sm">
                      View Pipeline &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            {(!data?.jobs || data.jobs.length === 0) && (
              <div className="py-8 text-center text-slate-500">
                No active jobs found. Create one to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
