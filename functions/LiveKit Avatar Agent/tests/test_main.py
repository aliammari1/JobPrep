"""Smoke tests for the LiveKit avatar agent.

These tests don't contact LiveKit/Simli or require a GPU, so they are safe in
CI. The full avatar session needs real credentials and a long-running container
(documented as out of scope for Cloudflare Workers).

`src/main.py` mid-file re-imports `livekit.rtc` / `livekit.agents` plugins that
are not part of the agent's declared runtime deps, so we validate it via AST
(structure + entry points) rather than executing the module.
"""

import ast
from pathlib import Path

_MAIN_PATH = Path(__file__).resolve().parent.parent / "src" / "main.py"
_SOURCE = _MAIN_PATH.read_text(encoding="utf-8")
_TREE = ast.parse(_SOURCE)


def _function_names() -> set[str]:
    return {
        node.name
        for node in ast.walk(_TREE)
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
    }


def test_main_py_parses():
    # ast.parse above already raises on syntax errors; assert it produced a module.
    assert isinstance(_TREE, ast.Module)


def test_defines_expected_entrypoints():
    names = _function_names()
    assert "spawn_avatar" in names
    assert "main" in names


def test_validates_required_credentials():
    # The agent must guard against missing LiveKit / Simli credentials.
    assert "Missing LiveKit credentials" in _SOURCE
    assert "Missing Simli credentials" in _SOURCE
    for var in ("LIVEKIT_API_KEY", "LIVEKIT_API_SECRET", "SIMLI_API_KEY"):
        assert var in _SOURCE
