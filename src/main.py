import uvicorn
from fastapi import FastAPI
from langchain.api.vector_api import app as vector_app
from langchain.api.chat_api import app as chat_app
from langchain.api.knowledge_api import app as knowledge_app
from version_control.api.version_api import app as version_app

app = FastAPI()

# 挂载子应用
app.mount("/vector", vector_app)
app.mount("/chat", chat_app)
app.mount("/knowledge", knowledge_app)
app.mount("/version", version_app)

@app.get("/")
async def root():
    return {
        "status": "success",
        "message": "服务正常运行",
        "services": {
            "vector": "/vector",
            "chat": "/chat",
            "knowledge": "/knowledge",
            "version": "/version"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 