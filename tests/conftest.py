"""测试配置."""
import os
import sys
from pathlib import Path

import pytest

# 添加项目根目录到Python路径
project_root = str(Path(__file__).parent.parent)
sys.path.append(project_root)

# 设置测试环境变量
os.environ["ENVIRONMENT"] = "test"
os.environ["OPENAI_API_KEY"] = "test-key"

@pytest.fixture(scope="session")
def test_data_dir():
    """返回测试数据目录的路径"""
    path = os.path.join(project_root, "tests", "data")
    os.makedirs(path, exist_ok=True)
    return path

@pytest.fixture(scope="session")
def benchmark_results_dir():
    """返回基准测试结果目录的路径"""
    path = os.path.join(project_root, "tests", "benchmark_results")
    os.makedirs(path, exist_ok=True)
    return path 