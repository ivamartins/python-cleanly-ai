import httpx
from app.core.config import settings

class IOPaintClient:
    def __init__(self):
        self.base_url = settings.IOPAINT_URL

    async def health_check(self):
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/")
                return response.status_code == 200
            except Exception:
                return False
