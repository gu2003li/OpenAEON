---
name: tmux
description: 通过发送按键和抓取面板输出远程控制 tmux 会话，用于交互式 CLI。
metadata:
  { "openaeon": { "emoji": "🧵", "os": ["darwin", "linux"], "requires": { "bins": ["tmux"] } } }
---

# tmux 会话控制

通过发送按键和读取输出控制 tmux 会话。管理 Claude Code 会话必不可少。

## 使用场景

✅ **使用此技能时：**

- 监控 tmux 中的 Claude/Codex 会话
- 向交互式终端应用程序发送输入
- 从 tmux 中长时间运行的进程抓取输出
- 以编程方式导航 tmux 面板/窗口
- 检查现有会话中的后台工作

## 不使用场景

❌ **不使用此技能时：**

- 运行一次性 shell 命令 → 直接使用 `exec` 工具
- 启动新的后台进程 → 使用 `exec` 加 `background:true`
- 非交互式脚本 → 使用 `exec` 工具
- 进程不在 tmux 中
- 需要创建新的 tmux 会话 → 使用 `exec` 加 `tmux new-session`

## 示例会话

| 会话                 | 用途                     |
| ----------------------- | --------------------------- |
| `shared`                | 主要交互式会话 |
| `worker-2` - `worker-8` | 并行工作会话    |

## 常用命令

### 列出会话

```bash
tmux list-sessions
tmux ls
```

### 捕获输出

```bash
# 面板最后 20 行
tmux capture-pane -t shared -p | tail -20

# 整个回滚历史
tmux capture-pane -t shared -p -S -

# 窗口中的特定面板
tmux capture-pane -t shared:0.0 -p
```

### 发送按键

```bash
# 发送文本（不按回车）
tmux send-keys -t shared "hello"

# 发送文本 + 回车
tmux send-keys -t shared "y" Enter

# 发送特殊键
tmux send-keys -t shared Enter
tmux send-keys -t shared Escape
tmux send-keys -t shared C-c          # Ctrl+C
tmux send-keys -t shared C-d          # Ctrl+D (EOF)
tmux send-keys -t shared C-z          # Ctrl+Z (挂起)
```

### 窗口/面板导航

```bash
# 选择窗口
tmux select-window -t shared:0

# 选择面板
tmux select-pane -t shared:0.1

# 列出窗口
tmux list-windows -t shared
```

### 会话管理

```bash
# 创建新会话
tmux new-session -d -s newsession

# 杀死会话
tmux kill-session -t sessionname

# 重命名会话
tmux rename-session -t old new
```

## 安全发送输入

对于交互式 TUI（Claude Code、Codex 等），将文本和 Enter 拆分为单独发送，以避免粘贴/多行边缘情况：

```bash
tmux send-keys -t shared -l -- "Please apply the patch in src/foo.ts"
sleep 0.1
tmux send-keys -t shared Enter
```

## Claude Code 会话模式

### 检查会话是否需要输入

```bash
# 查找提示符
tmux capture-pane -t worker-3 -p | tail -10 | grep -E "❯|Yes.*No|proceed|permission"
```

### 批准 Claude Code 提示

```bash
# 发送 'y' 和 Enter
tmux send-keys -t worker-3 'y' Enter

# 或选择编号选项
tmux send-keys -t worker-3 '2' Enter
```

### 检查所有会话状态

```bash
for s in shared worker-2 worker-3 worker-4 worker-5 worker-6 worker-7 worker-8; do
  echo "=== $s ==="
  tmux capture-pane -t $s -p 2>/dev/null | tail -5
done
```

### 发送任务到会话

```bash
tmux send-keys -t worker-4 "Fix the bug in auth.js" Enter
```

## 注意事项

- 使用 `capture-pane -p` 打印到 stdout（对脚本至关重要）
- `-S -` 捕获整个回滚历史
- 目标格式：`session:window.pane`（例如 `shared:0.0`）
- 会话在 SSH 断开后仍然保持
