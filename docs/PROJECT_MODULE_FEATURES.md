# 项目管理模块功能说明

> BioLab ELN v3.3
> 最后更新: 2025-02-28

---

## 一、功能概览

### 1.1 项目列表页面

#### 视角切换（管理员专属功能）

| 视角 | 说明 | 可见项目 |
|------|------|----------|
| 普通视角 | 默认视角，显示与我相关的项目 | 我创建的 + 我参与的 |
| 我创建的项目 | 仅显示我作为负责人的项目 | ownerId === currentUser.id |
| 我参与的项目 | 仅显示我作为成员参与的项目 | 存在ProjectMember记录 |
| 全局视角 | 显示系统中所有项目 | 所有项目（带关系标记） |

#### 项目关系标记（全局视角下显示）
- ★ 我创建 - 项目负责人是我
- ○ 我参与 - 我是项目成员
- - 其他 - 仅因全局角色可访问

#### 项目卡片操作
- 查看项目详情
- 编辑项目信息（名称、描述、状态）
- 删除项目（仅超级管理员）

---

### 1.2 项目详情页面

#### Tab 1: 项目信息

**展示内容：**
- 项目状态（进行中/已结束/已归档）
- 项目负责人
- 成员数量
- 开始日期
- 预计结束日期
- 实际结束日期
- 创建时间
- 结束时间（已完成时）
- 归档时间（已归档时）
- 项目描述

**编辑功能（仅项目负责人和管理员可用，且项目状态为"进行中"）：**
- 编辑开始日期
- 编辑预计结束日期
- 编辑项目描述

#### Tab 2: 人员管理

**功能：**
- 查看项目成员列表
- 添加新成员（多选批量添加）
- 修改成员角色（负责人/参与人/观察员）
- 移除成员

**权限要求：**
- 只有项目负责人和管理员可以管理人员
- 项目负责人不能被移除

#### Tab 3: 项目文档

**文档类型：**
- 立项报告 (PROPOSAL)
- 进展报告 (PROGRESS_REPORT)
- 结题报告 (FINAL_REPORT)
- 其他文档 (OTHER)

**功能：**
- 上传文档
- 下载文档
- 删除文档

#### Tab 4: 实验记录

**功能：**
- 查看关联的实验记录列表
- 显示审核状态
- 点击跳转到实验详情

---

### 1.3 项目状态管理

#### 状态流转

```
进行中 (ACTIVE)
    │
    ├──[项目负责人操作]──→ 已结束 (COMPLETED)
    │                        │
    │                        ├──[项目负责人操作]──→ 已归档 (ARCHIVED)
    │                        │                        │
    │                        │                        └──[仅超级管理员]──→ 恢复
    │                        │
    │                        └──[项目负责人操作]──→ 恢复为进行中
    │
    └──[项目负责人操作]──→ 直接归档
```

#### 状态操作权限

| 操作 | 项目负责人 | 管理员 | 超级管理员 |
|------|-----------|--------|-----------|
| 结束项目 | ✅ | ✅ | ✅ |
| 恢复已结束项目 | ✅ | ✅ | ✅ |
| 归档项目 | ✅ | ✅ | ✅ |
| 解除归档 | ❌ | ❌ | ✅ |

#### 自动锁定机制
- 项目结束或归档时，自动锁定所有关联的实验记录
- 锁定后的实验记录不可编辑

---

## 二、API接口

### 2.1 项目列表

```
GET /api/projects?viewMode={default|my_created|my_joined|global}
```

**响应字段：**
```json
{
  "id": "string",
  "name": "string",
  "description": "string|null",
  "status": "ACTIVE|COMPLETED|ARCHIVED",
  "startDate": "string|null",
  "endDate": "string|null",
  "expectedEndDate": "string|null",
  "actualEndDate": "string|null",
  "completedAt": "string|null",
  "archivedAt": "string|null",
  "ownerId": "string",
  "members": [...],
  "_relation": "CREATED|JOINED|GLOBAL"
}
```

### 2.2 项目更新

```
PUT /api/projects/[id]
```

**请求体：**
```json
{
  "name": "string",           // 可选
  "description": "string",    // 可选
  "status": "string",         // 可选
  "startDate": "string",      // 可选
  "expectedEndDate": "string" // 可选
}
```

### 2.3 状态变更

```
PUT /api/projects/[id]/status
```

**请求体：**
```json
{
  "action": "complete|reactivate|archive|unarchive"
}
```

### 2.4 成员管理

```
GET  /api/projects/[id]/members        # 获取成员列表
POST /api/projects/[id]/members        # 添加成员
PUT  /api/projects/[id]/members/[uid]  # 修改成员角色
DEL  /api/projects/[id]/members/[uid]  # 移除成员
```

### 2.5 文档管理

```
GET  /api/projects/[id]/documents           # 获取文档列表
POST /api/projects/[id]/documents           # 上传文档
GET  /api/projects/[id]/documents/[docId]   # 下载文档
DEL  /api/projects/[id]/documents/[docId]   # 删除文档
```

---

## 三、权限体系

### 3.1 全局角色权限

| 角色 | 项目创建 | 查看所有项目 | 删除项目 | 解除归档 |
|------|---------|------------|---------|---------|
| 超级管理员 | ✅ | ✅ | ✅ | ✅ |
| 管理员 | ✅ | ✅ | ❌ | ❌ |
| 研究员 | ❌ | ❌ | ❌ | ❌ |

### 3.2 项目角色权限

| 角色 | 编辑项目信息 | 人员管理 | 文档管理 | 状态变更 |
|------|------------|---------|---------|---------|
| 项目负责人 | ✅ | ✅ | ✅ | ✅ |
| 参与人 | ❌ | ❌ | ❌ | ❌ |
| 观察员 | ❌ | ❌ | ❌ | ❌ |

---

## 四、数据模型

### 4.1 Project

```prisma
model Project {
  id              String        @id
  name            String
  description     String?
  status          ProjectStatus @default(ACTIVE)
  startDate       DateTime?
  endDate         DateTime?        // 兼容字段
  expectedEndDate DateTime?        // 预计结束日期
  actualEndDate   DateTime?        // 真实结束日期
  completedAt     DateTime?        // 结束时间戳
  archivedAt      DateTime?        // 归档时间戳
  ownerId         String
  members         User[]
  projectMembers  ProjectMember[]
  // ...
}
```

### 4.2 ProjectMember

```prisma
model ProjectMember {
  id        String            @id
  projectId String
  userId    String
  role      ProjectMemberRole @default(MEMBER)
  joinedAt  DateTime          @default(now())
  // ...
}

enum ProjectMemberRole {
  PROJECT_LEAD  // 项目负责人
  MEMBER        // 参与人
  VIEWER        // 观察员
}
```

---

## 五、UI组件

### 5.1 项目列表组件

**文件**: `src/components/projects/ProjectList.tsx`

**功能**:
- 视角切换下拉菜单
- 项目搜索和状态筛选
- 项目卡片网格展示
- 关系标记显示（全局视角）

### 5.2 项目详情组件

**文件**: `src/components/projects/ProjectDetail.tsx`

**功能**:
- 四大Tab切换
- 基本信息编辑模式
- 成员管理对话框
- 文档上传对话框
- 状态操作下拉菜单

### 5.3 创建项目对话框

**文件**: `src/components/projects/CreateProjectDialog.tsx`

**功能**:
- 项目名称输入
- 项目描述输入
- 开始日期选择
- 预计结束日期选择

---

## 六、已完成的开发任务

- [x] 项目列表视角切换功能
- [x] 全局视角项目分类显示
- [x] 项目关系标记显示
- [x] 项目基本信息编辑功能
- [x] 项目描述显示修复
- [x] 项目成员管理功能
- [x] 项目文档管理功能
- [x] 项目状态变更功能
- [x] 后端API字段处理优化

---

## 七、待完成/待优化的部分

### 7.1 待修复问题
- [ ] 无

### 7.2 待优化功能
- [ ] 项目列表分页/虚拟滚动（大量项目时）
- [ ] 项目详情编辑历史记录
- [ ] 项目批量操作功能

### 7.3 待确认需求
- [ ] 项目成员角色变更是否需要通知
- [ ] 项目归档后是否需要保留成员关系

---

*文档维护: AI Assistant*
