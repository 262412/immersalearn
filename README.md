# ImmersaLearn

将教材文本一键转化为可交互的 3D 学习体验，面向小学生（5–11岁）。

**Tech stack:** Next.js 15 (App Router) · React Three Fiber · Anthropic Claude · Zustand · TypeScript

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 并填写：

```bash
cp .env.example .env.local
```

| 变量 | 必需 | 说明 |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✓ | Claude API Key |
| `ENABLE_SKETCHFAB` | | `true` 时启用 Sketchfab 3D 模型搜索 |
| `SKETCHFAB_API_TOKEN` | | 配合上面使用，获取 GLB 下载链接 |

### 3. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

---

## 使用流程

1. **首页** — 输入或上传教材（PDF / DOCX / TXT / MD），选择学科、主题、课程标准、体裁、难度
2. **生成** — 系统调用 `/api/generate`，依次执行 Planning → Building → Assembling → (Sketchfab)，约 15–30 秒
3. **体验** — 进入 3D 场景，点击 NPC 触发对话，点击物件查看知识弹窗
4. **Review / Report** — 查看场景设计摘要，或查看当前 session 学习报告

---

## Pipeline 架构

```
用户输入
  ├─ POST /api/upload       → 解析 PDF / DOCX / TXT
  └─ POST /api/generate     → 4步统一生成
       ├─ Step 1  Planning Agent   (claude-sonnet-4)   → WorldPlan
       ├─ Step 2  Builder Agent    (claude-haiku-4-5)  → raw SceneGraph
       ├─ Step 3  Assembler        (确定性)             → final SceneGraph
       └─ Step 4  Asset Agent      (可选)               → Sketchfab GLB URLs

体验页 /experience/[id]
  └─ POST /api/chat         → NPC 实时对话 (claude-haiku-4-5)
```

---

## 代码结构

```
src/
  app/
    page.tsx                    # 首页 — 输入表单 + 生成入口
    generate/page.tsx           # 生成进度显示
    experience/[id]/page.tsx    # 3D 体验主页面
    review/[id]/page.tsx        # 场景审阅
    report/[id]/page.tsx        # 学习报告
    api/
      upload/route.ts           # 文件解析
      generate/route.ts         # 统一生成编排（主入口）
      chat/route.ts             # NPC 实时对话

  lib/
    agents/
      planning-agent.ts         # Sonnet 4，单次 tool_use，输出 WorldPlan
      builder-agent.ts          # Haiku 4.5，循环 tool_use ≤25轮，构建 SceneGraph
      npc-dialogue.ts           # Haiku 4.5，实时对话，facts 过滤
      asset-agent.ts            # Sketchfab 搜索，内存缓存，并发
    scene/
      assembler.ts              # 确定性 4步组装（主流程）
      normalize-scene.ts        # AI 输出容错填充
      scene-builder.ts          # SceneGraphBuilder 类
      asset-registry.ts         # 内置 compound primitive 资产库
    types/
      world-plan.ts             # WorldPlan（核心数据结构）
      scene-graph.ts            # SceneGraph（渲染数据结构）
      index.ts                  # SessionState / ChoiceContent 等共享类型
    pedagogy/methods.ts         # 教学法定义（Bloom 层次）

  components/
    three/                      # R3F 渲染（SceneRenderer / Environment / NPCEntities …）
    ui/                         # UI 覆盖层（HUD / DialoguePanel / ChoicePanel / ExaminePopup …）

  stores/
    session-store.ts            # Zustand 全局状态

packages/
  npc-dialogue/                 # 可复用 NPC 对话 Skill（见下方）
```

---

## NPC 对话 Skill（可复用）

`packages/npc-dialogue/` 是一个独立的、无 ImmersaLearn 内部依赖的 NPC 对话模块，可直接复制到任意 Next.js / React 项目使用。

**包含：**

| 文件 | 用途 |
|---|---|
| `types.ts` | 通用 TypeScript 类型 |
| `agent.ts` | 服务端 Anthropic 逻辑（框架无关） |
| `route.ts` | Next.js App Router 路由（复制即用） |
| `useNPCDialogue.ts` | React Hook（对话状态管理） |
| `DialoguePanel.tsx` | 完整 React 组件（含快速回复按钮） |

**3 步集成：**

```bash
# 1. 复制目录到目标项目
cp -r packages/npc-dialogue/ <目标项目>/src/lib/npc-dialogue/

# 2. 挂载路由
cp src/lib/npc-dialogue/route.ts src/app/api/npc-chat/route.ts

# 3. 在页面中使用
```

```tsx
import { NPCDialogue } from "@/lib/npc-dialogue/DialoguePanel";

<NPCDialogue
  character={{ id: "c1", name: "Luna", role: "Space guide", personality: "Curious", speech_style: "Simple, fun" }}
  facts={[{ id: "f1", statement: "The Sun is a star." }]}
  scene={{ description: "Space station", objective: "Learn about the Solar System" }}
  onClose={() => setOpen(false)}
/>
```

详细文档见 [packages/npc-dialogue/README.md](packages/npc-dialogue/README.md)

---

## 关键设计决策

- **单一 Pipeline**：`/api/generate` 是唯一生成入口，Planning + Builder + Assembler 串行，清晰可追踪
- **双层资产降级**：AssetRegistry compound primitives（始终可用）→ Sketchfab GLB（可选增强）
- **确定性后处理**：Builder Agent 输出经 `assembleScene` 四步确定性修复，保证渲染不崩溃
- **类型直通**：`WorldPlan` 原生类型贯穿前后端，无中间层适配

---

## 技术报告

完整的 Pipeline 说明、数据契约、反幻觉机制和开发路线图，见：

[docs/immersalearn_pipeline_tech_report_2026-04-04.md](docs/immersalearn_pipeline_tech_report_2026-04-04.md)
