# ImmersaLearn 技术报告（Pipeline 与架构）

- 版本日期：2026-04-04
- 项目：immersalearn（Next.js + React Three Fiber + Anthropic Agents）
- 报告目的：用于团队技术对齐，统一当前系统“实际运行链路”和“代码层级边界”认知。

---

## 1. 执行摘要（TL;DR）

当前系统已经形成 **“新主流程（Unified）+ 旧流程（Legacy）并存”** 的状态：

1. **主流程（生产实际在走）**：
   - 上传教材 → 统一生成 `/api/generate` → 返回 `WorldPlan + SceneGraph` → 进入体验页 `/experience/[id]` → 运行时 NPC 对话 `/api/chat`
2. **旧流程（代码保留，前端未接）**：
   - `/api/extract` → `/api/script` → `/api/verify` → `/api/scene`
3. **技术结构特点**：
   - 前端是 App Router + Zustand；
   - 后端路由层做 Agent 编排；
   - Scene 采用 “LLM 生成 + 确定性标准化/组装” 双层机制；
   - 运行时对话强调 anti-hallucination（只使用相关 facts）。

---

## 2. 项目目标与设计原则

ImmersaLearn 的核心目标是：将教材文本转化为可交互的 3D 学习体验，服务小学年龄段（5-11岁）用户。

主要设计原则：

1. **课程对齐**：输入支持 `subject/topic/curriculum`。
2. **低幻觉风险**：限制事实来源，尽量由结构化知识驱动。
3. **儿童友好**：简短语句、互动反馈、鼓励式对话。
4. **可运行优先**：AI 输出后使用 deterministic 层做 normalize/assemble，避免渲染崩溃。
5. **模块可替换**：Agent 层、Scene 层、渲染层之间边界清晰。

---

## 3. 端到端 Pipeline（当前主流程）

### 3.1 流程概览

```mermaid
flowchart LR
  A[首页输入教材/偏好] --> B[/api/upload 解析文件]
  A --> C[/api/generate 统一生成]
  B --> A
  C --> D[Planning Agent: WorldPlan]
  D --> E[Builder Agent: Raw SceneGraph]
  E --> F[Assembler+Normalizer]
  F --> G{ENABLE_SKETCHFAB?}
  G -- true --> H[Asset Agent 增强模型URL]
  G -- false --> I[使用内置低模资产/primitive]
  H --> J[返回 worldPlan+sceneGraph]
  I --> J
  J --> K[Zustand: setWorldPlan/initSession]
  K --> L[/experience/[id] 3D场景]
  L --> M[/api/chat NPC对话]
```

### 3.2 详细分阶段

1. **输入阶段（首页）**
   - 用户输入：文本/上传文件、学科、主题、课程标准、风格、难度。
   - 上传文件支持：PDF/TXT/MD/DOCX。

2. **上传解析阶段（`/api/upload`）**
   - PDF：`unpdf` 解析。
   - DOCX：轻量 XML 文本抽取。
   - 返回标准化文本给前端编辑确认。

3. **统一生成阶段（`/api/generate`）**
   - Step 1 `createWorldPlan`：从教材直接产出知识层 + 叙事层 + 世界设定。
   - Step 2 `buildScene`：tool-use 循环式构建 SceneGraph。
   - Step 3 `assembleScene`：对输出做规范化与补全。
   - Step 4 `enhanceSceneWithModels`（可选）：Sketchfab 搜索模型 URL。

4. **运行阶段（`/experience/[id]`）**
   - Canvas 加载 SceneGraph 渲染环境、结构体、NPC、交互物件。
   - 点击 NPC/物件触发对话或知识弹窗。
   - 对话由 `/api/chat` 生成，受 `relevantFacts` 约束。

5. **统计与展示阶段**
   - Review 页：展示 worldPlan 的角色、场景、facts。
   - Report 页：基于 session 计算完成度与得分（当前为前端会话内统计）。

---

## 4. Legacy Pipeline（保留但未接主 UI）

当前代码仍保留以下 API：

1. `/api/extract`：知识图谱抽取（KnowledgeGraph）
2. `/api/script`：脚本生成（Script）
3. `/api/verify`：事实校验（VerificationReport）
4. `/api/scene`：脚本场景转 SceneGraph

结论：

- 这条链路仍可独立测试和演进；
- 但首页当前只调用 `/api/generate`，旧链路未参与主用户路径。

---

## 5. 代码架构分层

```mermaid
flowchart TB
  subgraph UI[UI/页面层]
    P1[app/page.tsx]
    P2[app/experience/[id]/page.tsx]
    P3[app/review/[id]/page.tsx]
    P4[app/report/[id]/page.tsx]
  end

  subgraph API[路由编排层]
    A1[api/upload]
    A2[api/generate]
    A3[api/chat]
    A4[api/extract/script/verify/scene]
  end

  subgraph AGENT[Agent层]
    G1[planning-agent]
    G2[builder-agent]
    G3[npc-dialogue]
    G4[asset-agent]
    G5[legacy agents]
  end

  subgraph SCENE[Scene确定性层]
    S1[normalize-scene]
    S2[assembler]
    S3[scene-builder]
    S4[asset-registry]
  end

  subgraph R3F[3D渲染层]
    R1[SceneRenderer]
    R2[Environment]
    R3[NPCEntities]
    R4[InteractiveObjects]
    R5[ModelLoader]
  end

  subgraph STATE[状态层]
    Z1[Zustand session-store]
  end

  UI --> API --> AGENT --> SCENE --> API --> UI
  UI <--> STATE
  UI --> R3F
```

---

## 6. 关键数据契约（Data Contracts）

### 6.1 WorldPlan（主流程核心）

- 文件：`src/lib/types/world-plan.ts`
- 包含两层：
  1. `knowledge`：subject/topic/objectives/facts
  2. `narrative`：title/genre/characters/scenes
- `WorldScene` 内统一包含：
  - story（目标与叙事）
  - world（环境、landmarks、npc_placements、interactive_items）
  - interactions（教学互动定义）

### 6.2 SceneGraph（渲染核心）

- 文件：`src/lib/types/scene-graph.ts`
- 关键字段：
  - `environment`
  - `layout`
  - `structures`
  - `npcs`
  - `interactive_objects`
  - `triggers`
  - `cinematic_sequences`

### 6.3 SessionState（运行时核心）

- 文件：`src/lib/types/index.ts`
- 记录：`current_scene`、`completed_interactions`、`discoveries`、`choices_log` 等。

---

## 7. 反幻觉与稳定性机制

### 7.1 反幻觉（内容层）

1. Planning prompt 明确要求只从教材抽事实。
2. NPC 对话使用 `getRelevantFacts` 提供上下文，系统提示禁止编造。
3. Legacy 中保留 `fact-verifier`（自动+AI混合校验）作为二层保障。

### 7.2 稳定性（工程层）

1. `normalizeSceneGraph`：容错 AI 输出结构差异，补默认值。
2. `assembleScene`：修复 NPC `character_ref`，填充 fallback 结构。
3. `ModelLoader`：GLB 加载失败自动回退 primitive。
4. `asset-agent`：无 token 或检索失败时优雅降级。

---

## 8. 前端运行时架构（体验页）

体验页主要职责：

1. 从 store 获取 `worldPlan + currentSceneGraph + session`。
2. 将 worldPlan 映射为对话上下文（角色、facts、scene objective）。
3. SceneRenderer 渲染 3D：
   - Environment（天空/地形/光照/粒子）
   - SceneObjects（结构）
   - NPCEntities（NPC）
   - InteractiveObjects（可互动物件）
4. UI Overlay：
   - NarrationOverlay
   - HUD
   - DialoguePanel
   - ExaminePopup
   - ChoicePanel（组件在，但新流程 choice 还未真正接通）

---

## 9. 配置与依赖

### 9.1 关键依赖

1. `next` + `react` + `typescript`
2. `@react-three/fiber` + `drei` + `postprocessing`
3. `@anthropic-ai/sdk`
4. `zustand`
5. `unpdf`

### 9.2 环境变量

1. `ANTHROPIC_API_KEY`（必需）
2. `ENABLE_SKETCHFAB=true`（可选开关）
3. `SKETCHFAB_API_TOKEN`（可选，启用模型下载）

---

## 10. 当前差距与对齐风险

1. **双 pipeline 并存造成认知分裂**
   - 主流程已 unified，但 legacy API 仍在。
2. **多场景能力未打通到用户路径**
   - 当前 generate 默认只使用第一 scene。
3. **Choice 互动在新流程中未闭环**
   - UI 有组件，场景触发存在 TODO。
4. **报告未持久化**
   - report 基于本地 session，不是后端持久学习档案。
5. **文档滞后**
   - README 仍是 Next 默认模板，未反映真实架构。

---

## 11. 建议的技术路线（建议用于团队对齐）

### Phase 1（短期，1-2周）

1. 明确官方主链路：以 `/api/generate` 为唯一对外生成入口。
2. 更新 README：补齐架构图、环境变量、运行方式。
3. 打通 Choice 交互闭环：WorldPlan interaction → Scene trigger → ChoicePanel → session log。

### Phase 2（中期，2-4周）

1. 打通多 scene progression（scene 切换、剧情推进、触发条件）。
2. 增加 report 后端化与持久化（支持班级/学生长期追踪）。
3. 抽象 pipeline orchestrator（便于 A/B 比较 unified 与 legacy 质量）。

### Phase 3（中长期）

1. 引入自动评估基线（事实准确率、目标覆盖率、互动完成率）。
2. 加入资产缓存/CDN策略，降低生成时延。
3. 建立 prompt/config 版本治理，支持稳定回溯。

---

## 12. 对齐结论（可直接在会议里复述）

1. 现在真实在跑的是 **Unified Pipeline**：`upload + generate + chat`。
2. 旧四段式链路仍在代码里，当前主要价值是实验和回退。
3. 架构分层清晰：页面/路由编排/Agent/确定性Scene/R3F渲染/状态。
4. 下一步应优先解决三件事：
   - 主流程文档化（避免团队误解）
   - Choice 与多场景闭环
   - 学习报告持久化

---

## 13. 附录：关键目录地图

```text
src/
  app/
    page.tsx                 # 首页输入与统一生成入口
    experience/[id]/page.tsx # 3D体验运行时主页面
    review/[id]/page.tsx     # 教师审阅
    report/[id]/page.tsx     # 学习报告
    api/
      upload/route.ts
      generate/route.ts
      chat/route.ts
      extract/route.ts
      script/route.ts
      verify/route.ts
      scene/route.ts

  lib/
    agents/                  # LLM agents
    scene/                   # normalize/assemble/builder/asset-registry
    types/                   # world-plan/scene-graph/script/knowledge-graph
    pedagogy/                # 教学法定义

  components/
    three/                   # R3F渲染
    ui/                      # Overlay与交互面板

  stores/
    session-store.ts         # Zustand全局状态
```

---

> 备注：本报告基于当前代码快照（2026-04-04）整理，建议在核心接口或数据结构变更后同步更新本文件。
