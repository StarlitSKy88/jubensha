import uvicorn
from fastapi import FastAPI
from langchain.api.vector_api import app as vector_app
from version_control.api.version_api import app as version_app

app = FastAPI()

# 挂载子应用
app.mount("/vector", vector_app)
app.mount("/version", version_app)

@app.get("/")
async def root():
    return {
        "status": "success",
        "message": "服务正常运行",
        "services": {
            "vector": "/vector",
            "version": "/version"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 