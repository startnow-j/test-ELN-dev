# BioLab ELN 完整备份

> **备份日期**: 2025-02-28
> **版本**: v3.0
> **用途**: 系统回退后完整恢复

---

## 一、数据库模型完整定义

### 1.1 枚举类型

```prisma
enum UserRole {
  ADMIN         // 管理员
  PROJECT_LEAD  // 项目负责人（可审核）
  RESEARCHER    // 研究员
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum ReviewStatus {
  DRAFT
  PENDING_REVIEW
  NEEDS_REVISION
  LOCKED
}

enum ExtractionStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum ReviewAction {
  SUBMIT           // 提交审核（附带留言）
  APPROVE          // 审核通过
  REQUEST_REVISION // 要求修改
}

enum AttachmentCategory {
  DOCUMENT
  DATA_FILE
  IMAGE
  RAW_DATA
  LOCKED_PDF
  REVIEW_ATTACHMENT  // 审核附件（批注文件等）
  OTHER
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  SUBMIT_REVIEW
  APPROVE
  REQUEST_REVISION
}
```

### 1.2 核心模型

#### User (用户)
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  password      String
  role          UserRole  @default(RESEARCHER)
  avatar        String?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // 关联
  projects      Project[]
  ownedProjects Project[]        @relation("OwnedProjects")
  experiments   Experiment[]
  templates     Template[]
  attachments   Attachment[]
  reviewFeedbacks ReviewFeedback[]
  auditLogs     AuditLog[]
}
```

#### Project (项目)
```prisma
model Project {
  id          String        @id @default(cuid())
  name        String
  description String?
  status      ProjectStatus @default(ACTIVE)
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  ownerId     String
  owner       User          @relation("OwnedProjects", fields: [ownerId], references: [id])
  members     User[]
  experimentProjects ExperimentProject[]
}
```

#### Experiment (实验记录)
```prisma
model Experiment {
  id          String          @id @default(cuid())
  title       String
  summary     String?
  conclusion  String?

  extractedInfo   String?
  extractionStatus ExtractionStatus @default(PENDING)
  extractionError String?

  reviewStatus    ReviewStatus @default(DRAFT)
  completenessScore Int       @default(0)

  tags        String?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  submittedAt DateTime?
  reviewedAt  DateTime?

  authorId    String
  author      User            @relation(fields: [authorId], references: [id])
  experimentProjects ExperimentProject[]
  attachments Attachment[]
  reviewFeedbacks ReviewFeedback[]
  versions    ExperimentVersion[]
}
```

#### ReviewFeedback (审核反馈/沟通)
```prisma
model ReviewFeedback {
  id          String       @id @default(cuid())
  action      ReviewAction
  feedback    String?      // 提交留言或审核意见
  createdAt   DateTime     @default(now())

  experimentId String
  experiment   Experiment  @relation(fields: [experimentId], references: [id], onDelete: Cascade)
  reviewerId   String      // 提交人或审核人的ID
  reviewer     User        @relation(fields: [reviewerId], references: [id])

  attachmentId String?
  attachment   Attachment? @relation(fields: [attachmentId], references: [id], onDelete: SetNull)
}
```

#### Attachment (附件)
```prisma
model Attachment {
  id            String              @id @default(cuid())
  name          String
  type          String
  size          Int
  path          String
  category      AttachmentCategory  @default(DOCUMENT)
  extractedText String?
  createdAt     DateTime            @default(now())

  experimentId  String
  experiment    Experiment @relation(fields: [experimentId], references: [id], onDelete: Cascade)

  uploaderId    String
  uploader      User      @relation(fields: [uploaderId], references: [id])

  reviewFeedbacks ReviewFeedback[]
}
```

---

## 二、API路由完整清单

### 2.1 认证相关

| 路由 | 方法 | 功能 | 关键参数 |
|------|------|------|----------|
| `/api/auth/login` | POST | 用户登录 | email, password |
| `/api/auth/register` | POST | 用户注册 | email, name, password, role |
| `/api/auth/logout` | POST | 用户登出 | - |
| `/api/auth/me` | GET | 获取当前用户 | - |

### 2.2 项目相关

| 路由 | 方法 | 功能 | 关键参数 |
|------|------|------|----------|
| `/api/projects` | GET | 项目列表 | - |
| `/api/projects` | POST | 创建项目 | name, description, memberIds |
| `/api/projects/[id]` | GET | 项目详情 | - |
| `/api/projects/[id]` | PUT | 更新项目 | name, description, status, memberIds |
| `/api/projects/[id]` | DELETE | 删除项目 | - |

### 2.3 实验相关

| 路由 | 方法 | 功能 | 关键参数 |
|------|------|------|----------|
| `/api/experiments` | GET | 实验列表 | projectId, status, authorId |
| `/api/experiments` | POST | 创建实验 | title, summary, conclusion, projectIds, tags |
| `/api/experiments/[id]` | GET | 实验详情 | - |
| `/api/experiments/[id]` | PUT | 更新实验 | title, summary, conclusion, projectIds, tags |
| `/api/experiments/[id]` | DELETE | 删除实验 | - |
| `/api/experiments/[id]/extract` | POST | AI提取 | attachmentIds (可选) |
| `/api/experiments/[id]/submit` | POST | 提交审核 | submitNote (可选) |
| `/api/experiments/[id]/review` | POST | 审核操作 | action, feedback |

### 2.4 附件相关

| 路由 | 方法 | 功能 | 关键参数 |
|------|------|------|----------|
| `/api/attachments` | GET | 附件列表 | experimentId |
| `/api/attachments` | POST | 上传附件 | file, experimentId, category |
| `/api/attachments/[id]` | DELETE | 删除附件 | - |
| `/api/attachments/[id]/download` | GET | 下载附件 | - |

### 2.5 模板相关

| 路由 | 方法 | 功能 | 关键参数 |
|------|------|------|----------|
| `/api/templates` | GET | 模板列表 | - |
| `/api/templates` | POST | 创建模板 | name, description, content, tags |
| `/api/templates/[id]` | GET | 模板详情 | - |
| `/api/templates/[id]` | PUT | 更新模板 | name, description, content, tags |
| `/api/templates/[id]` | DELETE | 删除模板 | - |

---


### 3.2 提交审核API核心逻辑

```typescript
// /api/experiments/[id]/submit/route.ts
import { ReviewAction, AuditAction } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { submitNote } = body

  // 获取当前用户
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  // 获取实验记录
  const experiment = await db.experiment.findUnique({
    where: { id },
    include: { experimentProjects: true, attachments: true }
  })

  if (!experiment) {
    return NextResponse.json({ error: '实验记录不存在' }, { status: 404 })
  }

  // 权限检查
  if (experiment.authorId !== currentUser.id) {
    return NextResponse.json({ error: '无权操作' }, { status: 403 })
  }

  // 状态检查
  if (experiment.reviewStatus !== 'DRAFT' && experiment.reviewStatus !== 'NEEDS_REVISION') {
    return NextResponse.json({ error: '当前状态无法提交审核' }, { status: 400 })
  }

  // 完整度检查
  const score = calculateCompletenessScore(experiment)
  if (score < 60) {
    return NextResponse.json({ error: '完整度不足60%，请完善后再提交' }, { status: 400 })
  }

  // 更新状态
  await db.experiment.update({
    where: { id },
    data: {
      reviewStatus: 'PENDING_REVIEW',
      submittedAt: new Date(),
      completenessScore: score
    }
  })

  // 记录提交动作（含留言）
  await db.reviewFeedback.create({
    data: {
      experimentId: id,
      reviewerId: currentUser.id,
      action: ReviewAction.SUBMIT,
      feedback: submitNote || null
    }
  })

  // 审计日志
  await db.auditLog.create({
    data: {
      userId: currentUser.id,
      action: AuditAction.SUBMIT_REVIEW,
      entityType: 'Experiment',
      entityId: id
    }
  })

  return NextResponse.json({ success: true })
}
```

### 3.3 审核操作API核心逻辑

```typescript
// /api/experiments/[id]/review/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { action, feedback } = body

  const currentUser = await getCurrentUser()

  // 权限检查 - 只有ADMIN和PROJECT_LEAD可以审核
  if (currentUser.role !== 'ADMIN' && currentUser.role !== 'PROJECT_LEAD') {
    return NextResponse.json({ error: '无权审核' }, { status: 403 })
  }

  const experiment = await db.experiment.findUnique({
    where: { id }
  })

  if (experiment.reviewStatus !== 'PENDING_REVIEW') {
    return NextResponse.json({ error: '当前状态无法审核' }, { status: 400 })
  }

  // 根据操作类型更新状态
  let newStatus: ReviewStatus
  let auditAction: AuditAction

  if (action === 'APPROVE') {
    newStatus = 'LOCKED'
    auditAction = AuditAction.APPROVE
  } else if (action === 'REQUEST_REVISION') {
    newStatus = 'NEEDS_REVISION'
    auditAction = AuditAction.REQUEST_REVISION
  } else {
    return NextResponse.json({ error: '无效操作' }, { status: 400 })
  }

  // 更新实验状态
  await db.experiment.update({
    where: { id },
    data: {
      reviewStatus: newStatus,
      reviewedAt: new Date()
    }
  })

  // 记录审核意见
  await db.reviewFeedback.create({
    data: {
      experimentId: id,
      reviewerId: currentUser.id,
      action: action as ReviewAction,
      feedback: feedback || null
    }
  })

  // 审计日志
  await db.auditLog.create({
    data: {
      userId: currentUser.id,
      action: auditAction,
      entityType: 'Experiment',
      entityId: id,
      details: feedback
    }
  })

  return NextResponse.json({ success: true })
}
```

### 3.4 AI提取核心逻辑

```typescript
// /api/experiments/[id]/extract/route.ts
import { extractText } from '@/lib/fileParser'

const EXTRACTION_PROMPT = `你是一个专业的生物实验室数据提取助手。请从以下实验记录内容中提取关键信息。

请按以下JSON格式返回提取结果：
{
  "reagents": [{"name": "试剂名称", "specification": "规格", "batchNumber": "批号", "manufacturer": "厂家", "usage": "用量"}],
  "instruments": [{"name": "仪器名称", "model": "型号", "deviceId": "设备编号"}],
  "parameters": [{"name": "参数名称", "value": "数值", "unit": "单位"}],
  "steps": ["步骤1", "步骤2", ...],
  "safetyNotes": ["安全注意事项1", "安全注意事项2", ...]
}

实验记录内容：
`

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { attachmentIds } = body

  // 获取实验及其附件
  const experiment = await db.experiment.findUnique({
    where: { id },
    include: {
      attachments: {
        where: attachmentIds ? { id: { in: attachmentIds } } : undefined
      }
    }
  })

  // 提取所有附件文本
  const texts: string[] = []
  for (const attachment of experiment.attachments) {
    const text = await extractText(attachment.path, attachment.type)
    texts.push(`【${attachment.name}】\n${text}`)
  }

  const combinedText = texts.join('\n\n---\n\n')

  // 调用LLM提取
  const response = await fetch('https://api.example.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LLM_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: '你是一个专业的生物实验室数据提取助手。' },
        { role: 'user', content: EXTRACTION_PROMPT + combinedText }
      ],
      temperature: 0.3
    })
  })

  const data = await response.json()
  const extractedContent = data.choices[0].message.content

  // 保存提取结果
  await db.experiment.update({
    where: { id },
    data: {
      extractedInfo: extractedContent,
      extractionStatus: 'COMPLETED'
    }
  })

  return NextResponse.json({
    success: true,
    extractedInfo: JSON.parse(extractedContent)
  })
}
```

---

## 四、前端组件结构

### 4.1 核心组件清单

```
src/
├── app/
│   └── page.tsx                 # 主页面入口
├── contexts/
│   └── AppContext.tsx           # 全局状态管理
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx          # 侧边栏导航
│   │   └── Header.tsx           # 顶部导航
│   ├── experiments/
│   │   ├── ExperimentEditor.tsx    # 实验编辑器
│   │   ├── ExperimentDetail.tsx    # 实验详情
│   │   ├── ExperimentList.tsx      # 实验列表
│   │   ├── ReviewList.tsx          # 审核列表
│   │   └── ExtractedInfoPanel.tsx  # AI提取面板
│   ├── projects/
│   │   ├── ProjectList.tsx      # 项目列表
│   │   └── ProjectDetail.tsx    # 项目详情
│   ├── attachments/
│   │   ├── AttachmentManager.tsx   # 附件管理
│   │   └── FilePreviewDialog.tsx   # 文件预览
│   ├── templates/
│   │   ├── TemplateList.tsx     # 模板列表
│   │   └── TemplateEditor.tsx   # 模板编辑器
│   ├── dashboard/
│   │   └── Dashboard.tsx        # 仪表盘
│   └── editor/
│       └── RichTextEditor.tsx   # 富文本编辑器
```

### 4.2 状态管理结构

```typescript
// AppContext.tsx 核心状态
interface AppState {
  // 用户状态
  currentUser: User | null
  isAuthenticated: boolean

  // 数据列表
  projects: Project[]
  experiments: Experiment[]
  templates: Template[]

  // UI状态
  currentView: ViewType
  selectedExperiment: Experiment | null
  selectedProject: Project | null

  // 加载状态
  isLoading: boolean

  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  fetchProjects: () => Promise<void>
  fetchExperiments: (filters?) => Promise<void>
  createExperiment: (data) => Promise<Experiment>
  updateExperiment: (id: string, data) => Promise<void>
  deleteExperiment: (id: string) => Promise<void>
  submitForReview: (id: string, note?: string) => Promise<void>
  reviewExperiment: (id: string, action: string, feedback?: string) => Promise<void>
  extractInfo: (id: string, attachmentIds?: string[]) => Promise<void>
}
```

---


---

## 六、环境配置

### 6.1 必需环境变量

```env
# 数据库
DATABASE_URL="file:./db/custom.db"

# JWT密钥
JWT_SECRET="your-secret-key"

# AI服务（如使用）
LLM_API_KEY="your-api-key"
```

### 6.2 依赖包清单

```json
{
  "dependencies": {
    "next": "16.1.3",
    "react": "^19.0.0",
    "typescript": "^5.0.0",
    "@prisma/client": "^6.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "mammoth": "^1.6.0",
    "xlsx": "^0.18.5",
    "pdf-parse": "^1.1.1",
    "@tiptap/react": "^2.0.0",
    "@tiptap/starter-kit": "^2.0.0",
    "@tiptap/extension-table": "^2.0.0",
    "@tiptap/extension-image": "^2.0.0",
    "tailwindcss": "^4.0.0",
    "zod": "^3.0.0"
  }
}
```

