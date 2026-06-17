#!/usr/bin/env bash
set -euo pipefail

base_ref="${1:-origin/main}"
head_ref="${2:-HEAD}"

if [[ -n "$(git status --porcelain)" ]]; then
	echo "::error::Working tree must be clean before running PR CI parity; commit or stash intended changes first."
	exit 1
fi

if [[ "${base_ref}" == origin/* ]]; then
	base_branch="${base_ref#origin/}"
	git fetch origin "${base_branch}"
fi

worktree_dir="$(mktemp -d "${TMPDIR:-/tmp}/research-pr-ci.XXXXXX")"
cleanup() {
	git worktree remove --force "${worktree_dir}" >/dev/null 2>&1 || rm -rf "${worktree_dir}"
}
trap cleanup EXIT

git worktree add --detach "${worktree_dir}" "${head_ref}"

(
	cd "${worktree_dir}"

	git -c commit.gpgsign=false merge --no-edit "${base_ref}"

	pnpm install --frozen-lockfile
	git diff --check
	pnpm test
	pnpm lint
	node ops/scripts/validate-news-item-format.mjs --changed "${base_ref}...HEAD"
	node ops/scripts/validate-mix-alignment.mjs --changed "${base_ref}...HEAD"
	node ops/scripts/validate-mix-alignment.mjs
	pnpm build
)
