'use client'

import { useState, useEffect } from 'react'
import { AppProvider, useApp, Project, Experiment } from '@/contexts/AppContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { LoginPage } from '@/components/auth/LoginPage'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { ExperimentList } from '@/components/experiments/ExperimentList'
import { ProjectList } from '@/components/projects/ProjectList'
import { ExperimentEditor } from '@/components/experiments/ExperimentEditor'
import { ProjectDetail } from '@/components/projects/ProjectDetail'
import { ExperimentDetail } from '@/components/experiments/ExperimentDetail'
import { TemplateList } from '@/components/templates/TemplateList'
// ReviewList 已废弃，功能已合并到 MyTasks 组件
// import { ReviewList } from '@/components/experiments/ReviewList'
import { UserManagement } from '@/components/users/UserManagement'
import { FileManager } from '@/components/admin/FileManager'
import { MyTasks } from '@/components/tasks/MyTasks'
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog'
import { Toaster } from '@/components/ui/toaster'
import { Loader2 } from 'lucide-react'

function MainContent() {
  const { currentUser, isLoading, projects, experiments } = useApp()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [editingExperimentId, setEditingExperimentId] = useState<string | null>(null)
  const [viewingExperimentId, setViewingExperimentId] = useState<string | null>(null)
  const [viewingProjectId, setViewingProjectId] = useState<string | null>(null)
  const [isCreatingExperiment, setIsCreatingExperiment] = useState(false)
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  
  // 用于存储从 API 获取的项目详情（当项目不在 AppContext 中时）
  const [fetchedProject, setFetchedProject] = useState<Project | null>(null)
  const [isLoadingProject, setIsLoadingProject] = useState(false)
  const [projectExperiments, setProjectExperiments] = useState<Experiment[]>([])

  // 当 viewingProjectId 变化时，获取项目详情
  useEffect(() => {
    if (viewingProjectId) {
      // 先尝试从 AppContext 中查找
      const project = projects.find(p => p.id === viewingProjectId)
      if (project) {
        // 项目在 AppContext 中，使用现有数据
        setFetchedProject(null)
        setProjectExperiments(experiments.filter(e => 
          e.projects.some(p => p.id === viewingProjectId)
        ))
      } else {
        // 项目不在 AppContext 中，从 API 获取
        const fetchProject = async () => {
          setIsLoadingProject(true)
          try {
            const res = await fetch(`/api/projects/${viewingProjectId}`)
            if (res.ok) {
              const data = await res.json()
              // 转换 API 响应为 Project 类型
              const projectData: Project = {
                id: data.id,
                name: data.name,
                description: data.description,
                status: data.status,
                startDate: data.startDate,
                endDate: data.endDate,
                expectedEndDate: data.expectedEndDate,
                actualEndDate: data.actualEndDate,
                completedAt: data.completedAt,
                archivedAt: data.archivedAt,
                primaryLeader: data.primaryLeader,
                ownerId: data.ownerId,
                owner: data.owner,
                members: data.members || [],
                memberCount: data.memberCount,
                createdAt: data.createdAt,
                _relation: data._relation
              }
              setFetchedProject(projectData)
              
              // 转换实验数据
              const expData: Experiment[] = (data.experiments || []).map((exp: any) => ({
                id: exp.id,
                title: exp.title,
                summary: exp.summary,
                conclusion: exp.conclusion,
                extractedInfo: null,
                extractionStatus: 'PENDING',
                extractionError: null,
                reviewStatus: exp.reviewStatus,
                completenessScore: exp.completenessScore || 0,
                tags: exp.tags,
                authorId: exp.author?.id || '',
                author: exp.author,
                projects: [],
                attachments: [],
                createdAt: exp.createdAt,
                updatedAt: exp.updatedAt,
                submittedAt: null,
                reviewedAt: null
              }))
              setProjectExperiments(expData)
            } else {
              console.error('Failed to fetch project:', await res.text())
              setFetchedProject(null)
            }
          } catch (error) {
            console.error('Fetch project error:', error)
            setFetchedProject(null)
          } finally {
            setIsLoadingProject(false)
          }
        }
        fetchProject()
      }
    } else {
      // 清除获取的项目数据
      setFetchedProject(null)
      setProjectExperiments([])
    }
  }, [viewingProjectId, projects, experiments])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  // 未登录显示登录页面
  if (!currentUser) {
    return <LoginPage />
  }

  // 创建实验
  const handleCreateExperiment = () => {
    setEditingExperimentId(null)
    setIsCreatingExperiment(true)
    setActiveTab('experiments')
  }

  // 查看实验详情
  const handleViewExperiment = (id: string) => {
    setViewingExperimentId(id)
    setEditingExperimentId(null)
    setIsCreatingExperiment(false)
  }

  // 编辑实验
  const handleEditExperiment = (id: string) => {
    setEditingExperimentId(id)
    setViewingExperimentId(null)
    setIsCreatingExperiment(false)
  }

  // 创建项目
  const handleCreateProject = () => {
    setIsCreatingProject(true)
  }

  // 查看项目详情
  const handleViewProject = (id: string) => {
    setViewingProjectId(id)
  }

  // 返回列表
  const handleBack = () => {
    setEditingExperimentId(null)
    setViewingExperimentId(null)
    setViewingProjectId(null)
    setIsCreatingExperiment(false)
    setFetchedProject(null)
    setProjectExperiments([])
  }

  // 切换Tab时清除详情状态（允许从详情页直接导航到其他模块）
  const handleTabChange = (tab: string) => {
    // 清除所有详情/编辑状态
    setEditingExperimentId(null)
    setViewingExperimentId(null)
    setViewingProjectId(null)
    setIsCreatingExperiment(false)
    setIsCreatingProject(false)
    // 切换Tab
    setActiveTab(tab)
  }

  // 渲染内容
  const renderContent = () => {
    // 实验编辑器
    if (isCreatingExperiment || editingExperimentId) {
      return (
        <ExperimentEditor
          experimentId={editingExperimentId}
          onSave={handleBack}
          onCancel={handleBack}
        />
      )
    }

    // 实验详情
    if (viewingExperimentId) {
      const experiment = experiments.find(e => e.id === viewingExperimentId)
      if (experiment) {
        return (
          <ExperimentDetail
            experiment={experiment}
            onEdit={() => handleEditExperiment(viewingExperimentId)}
            onBack={handleBack}
          />
        )
      }
    }

    // 项目详情
    if (viewingProjectId) {
      // 显示加载状态
      if (isLoadingProject) {
        return (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">加载项目详情...</p>
            </div>
          </div>
        )
      }
      
      // 优先使用从 API 获取的项目，否则从 AppContext 中查找
      const project = fetchedProject || projects.find(p => p.id === viewingProjectId)
      if (project) {
        // 如果有获取的实验数据，使用它们；否则从 AppContext 过滤
        const projectExps = projectExperiments.length > 0 
          ? projectExperiments 
          : experiments.filter(e => e.projects.some(p => p.id === viewingProjectId))
        return (
          <ProjectDetail
            project={project}
            experiments={projectExps}
            onBack={handleBack}
            onViewExperiment={handleViewExperiment}
          />
        )
      }
    }

    // 主要标签页
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            onCreateExperiment={handleCreateExperiment}
            onViewExperiment={handleViewExperiment}
            onViewProject={handleViewProject}
          />
        )
      case 'experiments':
        return (
          <ExperimentList
            onCreateExperiment={handleCreateExperiment}
            onViewExperiment={handleViewExperiment}
          />
        )
      case 'projects':
        return (
          <ProjectList
            onCreateProject={handleCreateProject}
            onViewProject={handleViewProject}
          />
        )
      case 'templates':
        return <TemplateList />
      case 'my-tasks':
        return (
          <MyTasks 
            onViewExperiment={handleViewExperiment}
            onEditExperiment={handleEditExperiment}
          />
        )
      // 'review' 分支已移除，审核功能统一到 'my-tasks'
      // case 'review':
      //   return (
      //     <ReviewList onViewExperiment={handleViewExperiment} />
      //   )
      case 'users':
        return <UserManagement />
      case 'files':
        return <FileManager />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onCreateExperiment={handleCreateExperiment} />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
      
      {/* 创建项目对话框 */}
      <CreateProjectDialog 
        open={isCreatingProject} 
        onOpenChange={setIsCreatingProject} 
      />
      
      <Toaster />
    </div>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  )
}
