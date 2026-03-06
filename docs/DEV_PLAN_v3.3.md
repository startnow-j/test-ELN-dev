# BioLab ELN 开发计划 v3.3

> **文档版本**: v3.3.5  
> **创建日期**: 2025-02-28  
> **最后更新**: 2025-03-05  
> **状态**: 开发中

---

## 一、开发背景

### 1.1 当前版本状态

| 版本 | 状态 | 说明 |
|------|------|------|
| v3.0 | ✅ 完成 | AI提取、审核流程、完整度评分 |
| v3.1 | ✅ 完成 | 项目角色管理、用户管理、指定审核人、转交审核 |
| v3.2 | ✅ 完成 | 文件存储已重构、权限漏洞已修复 |
| v3.3 | ✅ 完成 | 超级管理员、暂存实验、界面优化 |
| v3.3.1 | ✅ 完成 | 项目主负责人、全局视角、成员数优化 |
| v3.3.5 | ✅ 完成 | 视角切换修复、审核管理合并到我的任务 |
| v3.4+ | 📋 规划中 | AI服务管理、锁定PDF等 |

### 1.2 v3.3 已完成功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 超级管理员角色 | ✅ 完成 | SUPER_ADMIN 角色，最高权限 |
| 暂存实验功能 | ✅ 完成 | 无项目关联实验存储在用户暂存区 |
| 文件迁移服务 | ✅ 完成 | 关联项目时自动迁移文件 |
| 审核管理合并 | ✅ 完成 | 已合并到"我的任务"模块 |
| 全局视角切换 | ✅ 完成 | 管理员可查看所有项目/实验 |
| 视角切换修复 | ✅ 完成 | API参数统一、独立数据获取 |
| 项目主负责人 | ✅ 完成 | 手写填入项目负责人 |
| 成员数优化 | ✅ 完成 | 正确计算并显示成员数 |

---

## 二、已完成功能清单

### 模块A：权限体系重构 ✅

| ID | 任务 | 文件 | 状态 |
|----|------|------|------|
| A1.1 | 数据库添加SUPER_ADMIN角色 | prisma/schema.prisma | ✅ 完成 |
| A1.2 | 创建超级管理员权限检查函数 | src/lib/permissions.ts | ✅ 完成 |
| A1.3 | 创建默认超级管理员账户 | 种子数据 | ✅ 完成 |
| A1.4 | 用户管理API权限调整 | src/app/api/users/manage/*.ts | ✅ 完成 |
| A1.5 | 项目删除权限调整 | src/app/api/projects/[id]/route.ts | ✅ 完成 |
| A1.6 | 超级管理员保护机制 | 相关API | ✅ 完成 |

### 模块B：暂存实验功能 ✅

| ID | 任务 | 文件 | 状态 |
|----|------|------|------|
| B1.1 | Experiment添加storageLocation字段 | prisma/schema.prisma | ✅ 完成 |
| B1.2 | 用户暂存区路径生成函数 | src/lib/file-path.ts | ✅ 完成 |
| B1.3 | 文件迁移服务 | src/lib/experiment-migration.ts | ✅ 完成 |
| B1.4 | 创建实验支持暂存 | src/app/api/experiments/route.ts | ✅ 完成 |
| B1.5 | 更新实验支持迁移 | src/app/api/experiments/[id]/route.ts | ✅ 完成 |
| B1.6 | 附件上传支持暂存区 | src/app/api/attachments/route.ts | ✅ 完成 |
| B1.7 | 暂存实验不能提交审核 | 提交审核逻辑 | ✅ 完成 |

### 模块D：界面优化 ✅

| ID | 任务 | 文件 | 状态 |
|----|------|------|------|
| D1.1 | 审核管理合并到我的任务 | src/components/tasks/MyTasks.tsx | ✅ 完成 |
| D1.2 | 全局视角切换 | 多个组件 | ✅ 完成 |
| D1.3 | 视角切换修复 | ExperimentList, MyTasks | ✅ 完成 |
| D2.1 | 详情页附件只读 | ExperimentDetail.tsx | ✅ 完成 |
| D3.1 | 搜索功能增强 | ExperimentList.tsx | ✅ 完成 |

### 模块E：项目管理优化 ✅

| ID | 任务 | 文件 | 状态 |
|----|------|------|------|
| E1.1 | 项目状态管理API完善 | src/app/api/projects/[id]/status/route.ts | ✅ 完成 |
| E1.2 | 项目状态前端完善 | src/components/projects/ProjectDetail.tsx | ✅ 完成 |
| E2.1 | 项目文档管理 | src/app/api/projects/[id]/documents/*.ts | ✅ 完成 |
| E3.1 | 项目主负责人字段 | 多个文件 | ✅ 完成 |
| E3.2 | 成员数计算优化 | src/app/api/projects/route.ts | ✅ 完成 |

---

## 三、待开发功能

### 高优先级

| 功能 | 说明 | 状态 |
|------|------|------|
| 锁定PDF生成 | 审核通过后生成标准化PDF | 📋 待开发 |
| AI服务管理 | Token管理、调用日志、使用统计 | 📋 待规划 |

### 中优先级

| 功能 | 说明 | 状态 |
|------|------|------|
| 项目列表分页 | 大量项目时的性能优化 | 📋 待开发 |
| 解锁审批功能 | 在我的任务中处理解锁申请 | 📋 待开发 |

### 低优先级

| 功能 | 说明 | 状态 |
|------|------|------|
| AI项目汇总 | 多选PDF分析 | 📋 待规划 |
| 10天未关联提醒 | 暂存实验提醒 | 📋 待开发 |

---

## 四、模块合并记录

### v3.4 审核管理合并到我的任务

**变更说明**:
- 原入口：侧边栏 → 审核管理
- 新入口：侧边栏 → 我的任务
- ReviewList 组件标记为废弃

**功能映射**:
| 原ReviewList Tab | 新MyTasks Tab |
|-----------------|---------------|
| 待审核 | 待我审核 |
| 待修改 | 待我修改 |
| 已锁定 | 我的已锁定记录 |

**参考文档**: MY_TASKS_MODULE.md

---

## 五、API变更汇总

### v3.3.5 API参数统一

| API | 旧参数 | 新参数 |
|-----|--------|--------|
| GET /api/experiments | globalView=true/false | viewMode=default/global |
| GET /api/projects | viewMode=default/global | 保持不变 |

### v3.3 新增API

| API | 说明 |
|-----|------|
| POST /api/experiments/[id]/extract | AI智能提取 |
| POST /api/experiments/[id]/submit | 提交审核 |
| POST /api/experiments/[id]/review | 审核操作 |
| PUT /api/projects/[id]/status | 项目状态变更 |
| POST /api/projects/[id]/documents | 项目文档上传 |

---

## 六、数据库变更汇总

```prisma
// ==================== v3.3 数据库变更 ====================

// 用户角色枚举
enum UserRole {
  SUPER_ADMIN   // v3.3新增
  ADMIN
  RESEARCHER
}

// Experiment 模型新增字段
model Experiment {
  storageLocation  String?   // "draft" | 项目ID
  primaryProjectId String?   // 主存储项目ID
  // ... 其他字段
}

// Project 模型新增字段
model Project {
  primaryLeader    String?    // 项目主负责人
  expectedEndDate  DateTime?  // 预计结束日期
  actualEndDate    DateTime?  // 真实结束日期
  completedAt      DateTime?  // 结束时间戳
  archivedAt       DateTime?  // 归档时间戳
  // ... 其他字段
}
```

---

## 七、测试计划

### 7.1 权限测试 ✅

| 测试项 | 结果 |
|-------|------|
| 超级管理员创建用户 | ✅ 通过 |
| 管理员创建用户 | ✅ 通过 |
| 超级管理员删除项目 | ✅ 通过 |
| 超级管理员修改自己角色 | ✅ 保护生效 |

### 7.2 暂存实验测试 ✅

| 测试项 | 结果 |
|-------|------|
| 创建无项目关联的实验 | ✅ 通过 |
| 暂存实验关联项目 | ✅ 通过 |
| 暂存实验提交审核 | ✅ 拒绝，提示先关联项目 |
| 删除暂存实验 | ✅ 通过 |

### 7.3 视角切换测试 ✅

| 测试项 | 结果 |
|-------|------|
| 管理员全局视角显示所有项目 | ✅ 通过 |
| 管理员普通视角只显示相关项目 | ✅ 通过 |
| 普通用户无视角切换按钮 | ✅ 通过 |

---

## 八、文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| 系统功能 | docs/SYSTEM_FEATURES_v3.3.md | 系统功能规划 |
| 开发计划 | docs/DEV_PLAN_v3.3.md | 本文档 |
| 待办事项 | docs/PENDING_TASKS.md | 开发进度追踪 |
| 工作日志 | docs/worklog.md | 历史开发记录 |
| 备份指南 | docs/BACKUP_RESTORE.md | 版本历史记录 |

---

**文档版本：** v3.3.5  
**最后更新：** 2025-03-05  
**状态：** 开发中
