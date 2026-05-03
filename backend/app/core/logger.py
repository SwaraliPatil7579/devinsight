import logging
import time
import asyncio
from collections import deque
from datetime import datetime

# In-memory ring buffer — last 100 log entries
_log_buffer: deque = deque(maxlen=100)
_subscribers: list = []

LOG_COLORS = {
    "GET":    "\033[94m",   # blue
    "POST":   "\033[92m",   # green
    "DELETE": "\033[91m",   # red
    "PUT":    "\033[93m",   # yellow
    "PATCH":  "\033[93m",
}
RESET = "\033[0m"
BOLD  = "\033[1m"
DIM   = "\033[2m"

logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
)
logger = logging.getLogger("devinsight")


def _status_color(status: int) -> str:
    if status < 300: return "\033[92m"   # green
    if status < 400: return "\033[93m"   # yellow
    return "\033[91m"                    # red


def push_log(entry: dict):
    """Push to buffer and notify all SSE subscribers."""
    _log_buffer.append(entry)
    dead = []
    for q in _subscribers:
        try:
            q.put_nowait(entry)
        except Exception:
            dead.append(q)
    for q in dead:
        _subscribers.remove(q)


def get_recent_logs() -> list:
    return list(_log_buffer)


def subscribe() -> asyncio.Queue:
    q: asyncio.Queue = asyncio.Queue()
    _subscribers.append(q)
    return q


def unsubscribe(q: asyncio.Queue):
    if q in _subscribers:
        _subscribers.remove(q)
