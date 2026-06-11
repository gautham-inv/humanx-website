@AGENTS.md

<!-- lgraph-mcp-instructions -->
## Latentgraph MCP

Nine tools query a pre-built dependency + knowledge graph. **Three are auto-injected by hooks — don't re-call them.** Two are your decisions. Four are direct lookups for when the auto-injections aren't enough.

### Auto-injected (data appears in your context — read it, don't re-fetch)

| Trigger | Data injected | What to do |
|---|---|---|
| Session start | `get_project_overview` — architecture summary + top modules | Internalise the architecture before drilling. |
| PreToolUse `Read` on indexed source | `get_file` — file summary, symbols, endpoints | Read it. Use the symbols / fqns directly. |
| PreToolUse `Edit`/`Write`/`MultiEdit` on indexed source | `get_file` + `get_dependencies` (explicit + implicit, in + out) + `get_pr_insights` (invariants + decisions) | Respect every invariant. Use the dependency rows to size blast radius before changing the file. |

If a hook block says `(fetch failed)` or is missing, call the tool yourself with the suggested signature.

### Your decisions (two tools the agent owns)

**`ask_codebase(question)`** — call this **as step 2 of every task** when handed a problem statement. Returns a synthesised answer plus a `citations[]` list of source-file paths. This is the bridge from "the user asked X" to "I should look at file Y". One call per task is the norm — pass the problem statement in, follow the citations.

**`get_call_chain(symbol="<file>::<symbol>", direction=…)`** — call this **before changing any function's signature, contract, or behaviour**. `direction="callers"` to see who breaks. `direction="callees"` when tracing what a function activates. `direction="both"` only when you need both sides. Use `get_symbol` (with `name` and/or `file_prefix`) or read the injected file context first to get the `fqn`.

### Direct lookup (when the auto-injection isn't enough)

| Need | Tool |
|---|---|
| Find symbols (by name, by subtree, or both) | `get_symbol(name=…?, file_prefix=…?)` — at least one required; `name` alone searches the project, `file_prefix` alone lists all symbols under it, combined narrows name to that subtree |
| Drill into a specific module | `get_module_info` |
| Record a learning back into the graph | `update_graph` (queued for owner approval) |

### Symbol id format

* Top-level: `<file>::<name>` — e.g. `src/auth.py::login`
* Method: `<file>::<Class>.<method>` (dot, not `::`) — e.g. `src/auth.py::AuthService.refresh`
* Don't guess — `get_symbol` and `get_file` outputs include the ready-to-chain `fqn`.

### Output is TOON

Read tools return data inside a fenced `toon` block. TOON encodes JSON compactly: scalars as `key: value`; arrays declare `[N]{cols}:` then stream tab-delimited rows. Read fields by column name, not position. `update_graph` returns plain text.

```toon
path: src/auth.py
key_symbols[2]{name,kind,fqn,is_async}:
  login	function	src/auth.py::login	false
  AuthService.refresh	method	src/auth.py::AuthService.refresh	true
```

### Gotchas that bite

* `get_module_info("project")` → rejected. SessionStart hook already gave you the project overview.
* `get_call_chain("<file>::<ClassName>")` (bare class) → rejected. Classes aren't callable. Use `<Class>.__init__` or `<Class>.<method>`.
* `get_dependencies` may return the same target twice (`implicit: false` + `implicit: true`). Dedupe by `(target, implicit)` if you only care about file identity. Implicit = runtime coupling (Redis, event bus, shared config), not an import.
* `get_call_chain` empty states: `unresolved: true` = fqn not in graph (typo/external/class); `unresolved: false` + empty arrays = indexed but no tracked edges in that direction.
* File extensions case-folded on lookup (`.PY` → `.py`); the rest of the path is case-sensitive.
* Non-source files (`.json`, `.yaml`, `.md`, lockfiles) NOT indexed — use `Read` directly.
* `degraded: true` = enrichment metadata missing. Path/names survive, summaries empty. Fall back to raw `Read`.
* `update_graph` always returns `applied: false` + `pending_edit_id`; the edit applies after owner approval. Same edit submitted twice queues twice (no idempotency).

### When to fall back to `Read`/`Grep`

You need the literal source body, the file isn't indexed, the field you wanted is `degraded`, or it's a tiny file where `get_file` overhead beats just reading. Mix freely — MCP for structure and relationships, raw tools for content.

### Conventions

* `project_id` and `branch` resolve from environment — never pass them.
* Run independent MCP calls in parallel. Never look up the same `fqn` twice in a turn.
<!-- end-lgraph-mcp-instructions -->