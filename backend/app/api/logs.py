import asyncio
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.core.logger import get_recent_logs, subscribe, unsubscribe

router = APIRouter(prefix="/api", tags=["logs"])


@router.get("/logs/recent")
def recent_logs():
    """Return the last 100 log entries as JSON."""
    return get_recent_logs()


@router.get("/logs/stream")
async def stream_logs():
    """SSE endpoint — streams live request logs to the frontend."""
    q = subscribe()

    async def event_generator():
        # First, flush recent history so the panel isn't empty on connect
        for entry in get_recent_logs():
            yield f"data: {json.dumps(entry)}\n\n"

        try:
            while True:
                try:
                    entry = await asyncio.wait_for(q.get(), timeout=15)
                    yield f"data: {json.dumps(entry)}\n\n"
                except asyncio.TimeoutError:
                    # keepalive ping
                    yield ": ping\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            unsubscribe(q)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
