from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()
active_connections: list[WebSocket] = []

async def broadcast(data: dict):
    disconnected = []
    for ws in active_connections:
        try:
            await ws.send_json(data)
        except:
            disconnected.append(ws)
    for ws in disconnected:
        active_connections.remove(ws)

@router.websocket("/ws/sensors")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections.remove(websocket)