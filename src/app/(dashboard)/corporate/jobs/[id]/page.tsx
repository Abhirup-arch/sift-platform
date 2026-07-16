'use client'

import { useEffect, useState, use } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getJobDetails, updateApplicationStatus, updateApplicationRating } from '@/app/actions/corporate'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LayoutList, KanbanSquare, Star, MapPin, Briefcase, FileText, Download, CheckCircle, XCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const COLUMNS = ['applied', 'screening', 'shortlisted', 'interview', 'offer', 'hired', 'rejected']

function SortableItem({ id, application, onClick }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(application)}
      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm mb-3 cursor-grab active:cursor-grabbing hover:border-blue-300 dark:hover:border-blue-700 transition-colors group relative"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
          {application.student_profiles?.full_name}
        </h4>
        <Badge variant={application.match_score > 80 ? 'default' : 'secondary'} className="text-[10px]">
          {application.match_score}% Match
        </Badge>
      </div>
      <p className="text-xs text-slate-500 line-clamp-1 mb-3">
        {application.student_profiles?.headline || 'No headline provided'}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={12}
              className={star <= (application.internal_rating || 0) ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-700"}
            />
          ))}
        </div>
        <span className="text-[10px] text-slate-400">
          {new Date(application.applied_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}

function Column({ id, title, applications, onAppClick }: any) {
  return (
    <div className="flex flex-col w-[300px] flex-shrink-0 bg-slate-50 dark:bg-zinc-950/50 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 h-full max-h-[calc(100vh-200px)]">
      <div className="p-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-100/50 dark:bg-zinc-900 flex justify-between items-center sticky top-0 z-10">
        <h3 className="font-semibold text-slate-700 dark:text-slate-300 capitalize text-sm">{title}</h3>
        <Badge variant="secondary" className="bg-white dark:bg-zinc-800 text-slate-600">{applications.length}</Badge>
      </div>
      <div className="p-3 overflow-y-auto flex-1 min-h-[150px]">
        <SortableContext id={id} items={applications.map((a: any) => a.id)} strategy={verticalListSortingStrategy}>
          {applications.map((app: any) => (
            <SortableItem key={app.id} id={app.id} application={app} onClick={onAppClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

export default function JobWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [job, setJob] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await getJobDetails(resolvedParams.id)
        setJob(data.job)
        setApplications(data.applications)
      } catch (err) {
        console.error(err)
        toast.error("Failed to load job details")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [resolvedParams.id])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Find the application being moved
    const app = applications.find(a => a.id === activeId)
    if (!app) return

    // Find target column
    let targetStatus = app.status
    if (COLUMNS.includes(overId)) {
      targetStatus = overId
    } else {
      const overApp = applications.find(a => a.id === overId)
      if (overApp) {
        targetStatus = overApp.status
      }
    }

    if (app.status !== targetStatus) {
      // Optimistic update
      const prevApps = [...applications]
      setApplications(apps => apps.map(a => a.id === activeId ? { ...a, status: targetStatus } : a))

      try {
        await updateApplicationStatus(activeId, targetStatus)
        toast.success(`Moved to ${targetStatus}`)
      } catch (err) {
        setApplications(prevApps)
        toast.error("Failed to move application")
      }
    }
  }

  const handleRating = async (appId: string, rating: number) => {
    const prevApps = [...applications]
    setApplications(apps => apps.map(a => a.id === appId ? { ...a, internal_rating: rating } : a))
    if (selectedApp?.id === appId) {
      setSelectedApp({ ...selectedApp, internal_rating: rating })
    }
    try {
      await updateApplicationRating(appId, rating)
    } catch (err) {
      setApplications(prevApps)
      toast.error("Failed to update rating")
    }
  }

  const openPanel = (app: any) => {
    setSelectedApp(app)
    setIsPanelOpen(true)
  }

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  const filteredApps = applications.filter(a => 
    a.student_profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.student_profiles?.headline?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950 sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Badge variant="outline" className="text-highlighter border-highlighter bg-highlighter/10">{job.status}</Badge>
            <span className="text-sm text-slate-500">{applications.length} Candidates</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{job.title}</h1>
          <div className="flex gap-4 mt-2 text-sm text-slate-500">
            <span className="flex items-center gap-1"><MapPin size={14}/> {job.location}</span>
            <span className="flex items-center gap-1"><Briefcase size={14}/> {job.employment_type}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="pipeline" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-8 py-4 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/20">
          <TabsList className="bg-slate-200/50 dark:bg-zinc-800">
            <TabsTrigger value="pipeline" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900"><KanbanSquare size={16} className="mr-2" /> Pipeline</TabsTrigger>
            <TabsTrigger value="table" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900"><LayoutList size={16} className="mr-2" /> Table View</TabsTrigger>
          </TabsList>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Search candidates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-visible:ring-blue-500"
            />
          </div>
        </div>

        <TabsContent value="pipeline" className="flex-1 overflow-x-auto overflow-y-hidden p-8 m-0 outline-none">
          <div className="flex gap-6 h-full items-start">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              {COLUMNS.map(colId => (
                <Column 
                  key={colId} 
                  id={colId} 
                  title={colId} 
                  applications={filteredApps.filter(a => a.status === colId)} 
                  onAppClick={openPanel}
                />
              ))}
            </DndContext>
          </div>
        </TabsContent>

        <TabsContent value="table" className="flex-1 overflow-auto p-8 m-0 outline-none">
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Match Score</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                {filteredApps.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-zinc-950/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-highlighter/20 text-highlighter">{app.student_profiles?.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{app.student_profiles?.full_name}</div>
                          <div className="text-xs text-slate-500">{app.student_profiles?.headline}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="capitalize">{app.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full ${app.match_score > 80 ? 'bg-signal' : 'bg-highlighter'}`} style={{ width: `${app.match_score}%`}} />
                        </div>
                        <span className="text-xs font-medium">{app.match_score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={14} className={star <= (app.internal_rating || 0) ? "text-amber-400 fill-amber-400" : "text-slate-300"} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{new Date(app.applied_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => openPanel(app)}>View Profile</Button>
                    </td>
                  </tr>
                ))}
                {filteredApps.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No candidates found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Candidate Panel Sheet */}
      <Dialog open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl sm:rounded-2xl">
          {selectedApp && (
            <>
              {/* Panel Header */}
              <div className="p-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-sm ring-1 ring-slate-100">
                    <AvatarFallback className="text-xl bg-highlighter text-ink">{selectedApp.student_profiles?.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl">{selectedApp.student_profiles?.full_name}</DialogTitle>
                    <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                      {selectedApp.student_profiles?.headline}
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {selectedApp.student_profiles?.location}</span>
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Badge className="bg-signal/20 text-signal hover:bg-signal/30 border-none px-2 py-0.5">{selectedApp.match_score}% AI Match</Badge>
                      <Badge variant="outline" className="capitalize text-slate-600 border-slate-300">{selectedApp.status}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={`cursor-pointer transition-colors ${star <= (selectedApp.internal_rating || 0) ? "text-amber-400 fill-amber-400" : "text-slate-200 hover:text-amber-200"}`}
                        onClick={() => handleRating(selectedApp.id, star)}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2 text-flag hover:text-flag hover:bg-flag/10 border-flag/20"><XCircle size={14}/> Reject</Button>
                    <Button size="sm" className="gap-2 bg-highlighter text-ink hover:bg-highlighter/90 font-bold"><CheckCircle size={14}/> Move to Next Stage</Button>
                  </div>
                </div>
              </div>

              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
                
                {/* Left Col: Profile Details */}
                <div className="w-full md:w-1/2 space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileText size={16} className="text-slate-400"/> Parsed Profile
                    </h4>
                    <div className="space-y-4">
                      {selectedApp.student_profiles?.skills && (
                        <div>
                          <p className="text-xs text-slate-500 mb-2">Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedApp.student_profiles.skills.map((s: string, i: number) => (
                              <Badge key={i} variant="secondary" className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 font-normal">{s}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedApp.student_profiles?.education && (
                        <div>
                          <p className="text-xs text-slate-500 mb-2">Education</p>
                          <div className="space-y-2">
                            {selectedApp.student_profiles.education.map((edu: any, i: number) => (
                              <div key={i} className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-lg border border-slate-100 dark:border-zinc-800">
                                <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{edu.school}</p>
                                <p className="text-sm text-slate-500">{edu.degree} • {edu.year}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-zinc-800">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Internal Notes</h4>
                    <div className="bg-slate-50 dark:bg-zinc-900 rounded-xl p-4 border border-slate-200 dark:border-zinc-800 space-y-4">
                      {selectedApp.internal_notes && selectedApp.internal_notes.length > 0 ? (
                        selectedApp.internal_notes.map((note: any, i: number) => (
                          <div key={i} className="text-sm">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Recruiter</span> <span className="text-xs text-slate-400 ml-2">{new Date(note.timestamp).toLocaleDateString()}</span>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">{note.note}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 italic">No notes yet. Add one to discuss with your team.</p>
                      )}
                      <div className="flex gap-2">
                        <Input placeholder="Type a private note..." className="h-9 text-sm bg-white dark:bg-zinc-950" />
                        <Button size="sm" className="bg-slate-800 text-white">Save</Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Col: Original Resume Viewer (Mocked display) */}
                <div className="w-full md:w-1/2 flex flex-col">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2"><FileText size={16} className="text-slate-400"/> Original Resume</span>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-highlighter hover:text-highlighter"><Download size={14}/> PDF</Button>
                  </h4>
                  <div className="flex-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center min-h-[400px] overflow-hidden relative group">
                    {/* Simulated PDF Viewer */}
                    <div className="absolute inset-4 bg-white shadow-sm border border-slate-200 p-8 text-xs text-slate-400 overflow-hidden opacity-90 rounded">
                      <div className="h-4 w-1/3 bg-slate-200 mb-4 rounded" />
                      <div className="h-2 w-1/4 bg-slate-200 mb-8 rounded" />
                      <div className="space-y-2 mb-6">
                        <div className="h-2 w-full bg-slate-100 rounded" />
                        <div className="h-2 w-5/6 bg-slate-100 rounded" />
                        <div className="h-2 w-full bg-slate-100 rounded" />
                        <div className="h-2 w-4/6 bg-slate-100 rounded" />
                      </div>
                      <div className="h-4 w-1/4 bg-slate-200 mb-4 rounded" />
                      <div className="space-y-2">
                        <div className="h-2 w-full bg-slate-100 rounded" />
                        <div className="h-2 w-full bg-slate-100 rounded" />
                      </div>
                    </div>
                    <div className="z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-sm font-medium shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2">
                      <FileText className="text-slate-400" size={24}/>
                      Preview Not Available
                      <span className="text-xs text-slate-500 font-normal block">This is a mocked PDF viewer block.</span>
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
