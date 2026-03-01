# BioLab ELN 待办事项

> 最后更新: 2025-02-28
> 下次会话继续开发参考

---

## 一、当前开发状态

### ✅ 已完成功能

| 模块 | 功能 | 完成日期 |
|------|------|----------|
| 用户认证 | 登录/注册/登出 | v1.0 |
| 项目管理 | 项目CRUD | v1.0 |
| 项目管理 | 成员管理 | v3.3 |
| 项目管理 | 文档管理 | v3.3 |
| 项目管理 | 状态流转 | v3.3 |
| 项目管理 | 全局视角切换 | v3.3 (2025-02-28) |
| 项目管理 | 基本信息编辑 | v3.3 (2025-02-28) |
| 实验记录 | 富文本编辑器 | v2.0 |
| 实验记录 | 附件管理 | v3.0 |
| 实验记录 | AI智能提取 | v3.0 |
| 实验记录 | 审核流程 | v3.0 |
| 我的任务 | 四大Tab | v3.3 |
| 模板管理 | 模板CRUD | v1.0 |

### 🔧 待完成功能

| 模块 | 功能 | 优先级 | 状态 |
|------|------|--------|------|
| 锁定PDF | 审核通过后生成PDF | 中 | 待开发 |
| AI项目汇总 | 多选PDF分析 | 低 | 待开发 |
| 项目管理 | 分页/虚拟滚动 | 低 | 待优化 |

---

## 二、下次开发任务

### 2.1 高优先级任务

#### 任务1: 项目基本信息编辑功能测试
- **状态**: 已开发完成，需用户验证
- **测试点**:
  - [ ] 编辑开始日期是否正常保存
  - [ ] 编辑预计结束日期是否正常保存
  - [ ] 编辑项目描述是否正常保存
  - [ ] 取消编辑是否正确恢复原值
- **相关文件**:
  - `src/components/projects/ProjectDetail.tsx`
  - `src/app/api/projects/[id]/route.ts`

#### 任务2: 全局视角功能测试
- **状态**: 已开发完成，需用户验证
- **测试点**:
  - [ ] 视角切换按钮是否仅管理员可见
  - [ ] 各视角下项目列表是否正确过滤
  - [ ] 全局视角下关系标记是否正确显示
- **相关文件**:
  - `src/components/projects/ProjectList.tsx`
  - `src/app/api/projects/route.ts`

### 2.2 中优先级任务

#### 任务3: 锁定PDF功能
- **描述**: 审核通过后自动生成标准化PDF
- **包含内容**:
  - 封面（项目信息、作者、日期）
  - 元数据（摘要、关键词）
  - AI提取信息（试剂、仪器、参数、步骤）
  - 审核记录
- **技术方案**: 使用 `@react-pdf/renderer` 或 `puppeteer`

#### 任务4: 项目成员角色变更通知
- **描述**: 当成员角色变更时发送系统通知
- **待确认**: 是否需要邮件/站内通知

### 2.3 低优先级任务

#### 任务5: AI项目汇总功能
- **描述**: 选择多个已锁定PDF，AI汇总分析
- **技术方案**: 使用 z-ai-web-dev-sdk 的 LLM 能力

#### 任务6: 项目列表性能优化
- **描述**: 大量项目时的分页或虚拟滚动
- **触发条件**: 项目数量 > 50

---

## 三、已知问题

### 3.1 已修复问题

| 问题 | 原因 | 修复日期 |
|------|------|----------|
| 添加成员按钮无效 | onClick未绑定 | 2025-02-28 |
| 项目描述不显示 | 条件渲染问题 | 2025-02-28 |
| 基本信息编辑保存失败 | npm包名错误 + API字段处理 | 2025-02-28 |

### 3.2 待确认问题

| 问题 | 描述 | 状态 |
|------|------|------|
| 无 | - | - |

---

## 四、代码变更摘要

### 本次会话变更的文件

| 文件路径 | 变更类型 | 说明 |
|----------|---------|------|
| `src/app/api/projects/route.ts` | 修改 | 支持viewMode参数和关系标记 |
| `src/app/api/projects/[id]/route.ts` | 修改 | 支持部分字段更新 |
| `src/components/projects/ProjectList.tsx` | 重构 | 添加视角切换功能 |
| `src/components/projects/ProjectDetail.tsx` | 重构 | 添加基本信息编辑功能 |
| `src/contexts/AppContext.tsx` | 修改 | 新增ProjectRelation类型 |
| `docs/PROJECT_GLOBAL_VIEW_PLAN.md` | 新建 | 规划文档 |
| `docs/PROJECT_MODULE_FEATURES.md` | 新建 | 功能说明文档 |
| `docs/PENDING_TASKS.md` | 新建 | 本待办事项文档 |

---

## 五、测试账户

| 邮箱 | 密码 | 角色 |
|------|------|------|
| superadmin@example.com | SuperAdmin123! | SUPER_ADMIN |
| admin@example.com | admin123 | ADMIN |
| researcher@example.com | Researcher123! | RESEARCHER |

---

## 六、下次会话启动指令

```
请帮我执行项目恢复：
1. 阅读 /home/z/my-project/BACKUP_RESTORE.md
2. 从 https://github.com/startnow-j/test-ELN-dev.git 克隆代码
3. 安装依赖并准备好开发环境
4. 阅读 /home/z/my-project/docs/PENDING_TASKS.md 了解待办事项
```

---

*文档维护: AI Assistant*
