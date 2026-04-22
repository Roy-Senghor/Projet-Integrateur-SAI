from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import json
 
router = APIRouter(tags=["Temps réel"])
 
 
class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []
 
    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
 
    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)
 
    async def broadcast(self, data: dict):
        message = json.dumps(data)
        for ws in self.active:
            try:
                await ws.send_text(message)
            except Exception:
                pass
 
 
manager = ConnectionManager()
 
 
@router.websocket("/ws/mesures")
async def websocket_mesures(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)