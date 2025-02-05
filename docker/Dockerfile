# 使用Python 3.11作为基础镜像
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONPATH=/app \
    PYTHONUNBUFFERED=1 \
    POETRY_VERSION=1.7.1 \
    POETRY_HOME=/opt/poetry \
    POETRY_VIRTUALENVS_CREATE=false

# 安装系统依赖
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        git \
        sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# 安装Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="${POETRY_HOME}/bin:$PATH"

# 复制项目文件
COPY pyproject.toml poetry.lock ./

# 安装项目依赖
RUN poetry install --no-dev --no-interaction --no-ansi

# 复制应用代码
COPY scriptai scriptai/
COPY alembic.ini ./
COPY migrations migrations/

# 创建必要的目录
RUN mkdir -p /app/data/backups \
    && mkdir -p /app/data/logs \
    && mkdir -p /app/data/cache

# 暴露端口
EXPOSE 8000

# 设置健康检查
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# 启动命令
CMD ["poetry", "run", "uvicorn", "scriptai.main:app", "--host", "0.0.0.0", "--port", "8000"] 