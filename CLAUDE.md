# CLAUDE.md - 智天学习乐园项目规范

## 项目概述

**项目名称**：智天的学习乐园（柳智天的教育网站）
**域名**：xirong.github.io（GitHub Pages 纯前端静态站）
**目标用户**：儿童（柳智天，5岁）
**技术栈**：HTML/CSS/JavaScript，Three.js 3D

主要模块：`space/`（宇宙探索）、`puzzle/`（地图拼图）、`math/`（数学学习）、`engineering/`（工程科普）

---

## 核心工作流程

### 1. Worktree 并行开发规范

本项目使用 git worktree 并行处理多个需求。各 worktree 独立开发、独立 commit，互不干扰。

**合并时机**：某个 worktree 的功能**完整完成**后，才合并到 master 并清理。不要合并开发中的半成品。

```bash
# 查看所有 worktree
git worktree list

# 查看哪些 worktree 分支已完成但未合并
git branch --no-merged master

# 功能完成后：合并 → 清理
git merge <worktree-branch-name>
git worktree remove <path>
git worktree prune
```

### 2. 代码完成后必须自测

写完代码后，用 Playwright MCP 验证功能，确认正确后再汇报。

```bash
# 启动本地服务器
python3 -m http.server 8765
# Playwright 访问 http://localhost:8765/path/to/file.html
# 验证完毕后停止服务器
```

### 3. 验证通过后默认提交并推远端

对这个仓库里的 agent，默认工作流再补一条：

- 代码改完后，先做最小必要验证
- 验证通过且没有明显风险时，继续完成 `git add`、`git commit`、`git push`
- 只提交本次改动涉及的文件，不要把仓库里已有的脏改动一并提交
- 如果验证失败、分支受保护、推送被拒绝，先说明原因，再停下

可优先使用仓库脚本：

```bash
./scripts/codex-verified-push.sh -m "你的提交说明" \
  -v "最小验证命令1" \
  -v "最小验证命令2" \
  -- path/to/file1 path/to/file2
```

---

## 关键技术规则

### 真实纹理优先

渲染现实物体（天体等）**必须用真实纹理贴图**，不用纯 shader 模拟。纹理目录：`space/textures/`，来源：Solar System Scope（CC BY 4.0）。代码只负责光照、动画、交互。

### 语音 TTS：Edge-TTS 预生成 MP3

- **永远不要**只用浏览器 Web Speech API 作为主方案
- **正确做法**：`edge-tts`（Python）预生成 MP3 → JS 用 `playAudio(path, fallbackText)` 播放 → 失败时降级到 `speak()`
- 语音：`zh-CN-XiaoxiaoNeural`（小晓）
- 生成脚本：`space/generate-audio.py`，音频目录：`space/audio/`

---

## 技术规范

- Three.js CDN：`r128`（three.min.js + OrbitControls）
- 字体：Noto Sans SC + Orbitron，CDN `fonts.loli.net`
- 中文注释，函数用 `// ============ 函数名 ============` 分隔
- 主分支：master，远程：GitHub Pages
