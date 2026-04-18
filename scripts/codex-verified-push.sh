#!/bin/bash
set -euo pipefail

usage() {
    cat <<'EOF'
用法：
  ./scripts/codex-verified-push.sh -m "提交说明" [-v "验证命令"]... [--dry-run] -- file1 [file2 ...]

说明：
  1. 先执行传入的验证命令
  2. 只 git add 你指定的文件
  3. 如果你明确指定了被 .gitignore 忽略的文件，会自动用 -f 加入
  4. commit 后推送到当前分支对应的 origin

示例：
  ./scripts/codex-verified-push.sh -m "Update galaxy page" \
    -v "node --check space/galaxy.js" \
    -v "bash -n scripts/codex-verified-push.sh" \
    -- space/galaxy.js scripts/codex-verified-push.sh
EOF
}

commit_message=""
dry_run="false"
verify_cmds=()
paths=()

while [[ $# -gt 0 ]]; do
    case "$1" in
        -m|--message)
            shift
            if [[ $# -eq 0 ]]; then
                echo "缺少提交说明" >&2
                usage
                exit 1
            fi
            commit_message="$1"
            ;;
        -v|--verify)
            shift
            if [[ $# -eq 0 ]]; then
                echo "缺少验证命令" >&2
                usage
                exit 1
            fi
            verify_cmds+=("$1")
            ;;
        -n|--dry-run)
            dry_run="true"
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        --)
            shift
            while [[ $# -gt 0 ]]; do
                paths+=("$1")
                shift
            done
            break
            ;;
        *)
            paths+=("$1")
            ;;
    esac
    shift
done

if [[ -z "$commit_message" ]]; then
    echo "提交说明不能为空" >&2
    usage
    exit 1
fi

if [[ ${#paths[@]} -eq 0 ]]; then
    echo "至少要指定一个要提交的文件" >&2
    usage
    exit 1
fi

repo_root="$(git rev-parse --show-toplevel)"
branch="$(git -C "$repo_root" branch --show-current)"

if [[ -z "$branch" ]]; then
    echo "当前不在可推送的分支上" >&2
    exit 1
fi

for path in "${paths[@]}"; do
    if [[ ! -e "$repo_root/$path" ]] && ! git -C "$repo_root" ls-files --error-unmatch -- "$path" >/dev/null 2>&1; then
        echo "文件不存在，也不是受 git 跟踪的路径: $path" >&2
        exit 1
    fi
done

echo "仓库: $repo_root"
echo "分支: $branch"
echo "提交说明: $commit_message"

if [[ ${#verify_cmds[@]} -gt 0 ]]; then
    echo "开始执行验证命令"
    for cmd in "${verify_cmds[@]}"; do
        echo "+ $cmd"
        if [[ "$dry_run" != "true" ]]; then
            (
                cd "$repo_root"
                bash -lc "$cmd"
            )
        fi
    done
else
    echo "未提供验证命令，直接进入提交流程"
fi

echo "+ git add -- ${paths[*]}"
if [[ "$dry_run" == "true" ]]; then
    echo "dry-run 模式，不会真的 commit 和 push"
    exit 0
fi

for path in "${paths[@]}"; do
    if ! git -C "$repo_root" add -- "$path" 2>/dev/null; then
        echo "路径被忽略，改用强制加入: $path"
        git -C "$repo_root" add -f -- "$path"
    fi
done

if git -C "$repo_root" diff --cached --quiet -- "${paths[@]}"; then
    echo "指定文件没有可提交的变更" >&2
    exit 1
fi

git -C "$repo_root" commit -m "$commit_message"
git -C "$repo_root" push origin "$branch"
