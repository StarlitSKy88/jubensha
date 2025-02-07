import pytest
import asyncio
import time
from datetime import datetime
import numpy as np
import pandas as pd
from typing import List, Dict, Any
import json
import os
from src.langchain.core.vector_store_optimized import VectorStoreOptimized
from src.utils.monitor import default_monitor

# 启动系统监控器
default_monitor.start()

class BenchmarkResult:
    """基准测试结果类"""
    def __init__(self, name: str):
        """初始化基准测试结果
        
        Args:
            name: 测试名称
        """
        self.name = name
        self.start_time = datetime.now()
        self.metrics = []
        self.summary = {
            "name": name,
            "start_time": self.start_time.isoformat(),
            "total_operations": 0,
            "total_duration": 0,
            "avg_memory_usage": 0,
            "avg_cpu_usage": 0,
            "cache_hits": 0,
            "cache_misses": 0
        }
    
    def add_metric(self,
                  operation: str,
                  batch_size: int,
                  data_size: int,
                  duration: float,
                  stats: Dict[str, Any]):
        """添加性能指标
        
        Args:
            operation: 操作名称
            batch_size: 批处理大小
            data_size: 数据大小
            duration: 持续时间
            stats: 性能统计信息
        """
        metric = {
            "timestamp": datetime.now().isoformat(),
            "operation": operation,
            "batch_size": batch_size,
            "data_size": data_size,
            "duration": duration,
            "throughput": data_size / duration if duration > 0 else 0,
            "memory_usage": stats.get("memory_usage", 0),
            "cpu_usage": stats.get("cpu_usage", 0),
            "cache_hits": stats.get("cache_hits", 0),
            "cache_misses": stats.get("cache_misses", 0)
        }
        self.metrics.append(metric)
        
        # 更新汇总信息
        self.summary["total_operations"] += 1
        self.summary["total_duration"] += duration
        self.summary["avg_memory_usage"] = np.mean([m["memory_usage"] for m in self.metrics])
        self.summary["avg_cpu_usage"] = np.mean([m["cpu_usage"] for m in self.metrics])
        self.summary["cache_hits"] = stats.get("cache_hits", 0)
        self.summary["cache_misses"] = stats.get("cache_misses", 0)
    
    def save_report(self, path: str):
        """保存测试报告
        
        Args:
            path: 报告保存路径
        """
        # 确保目录存在
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        # 更新最终汇总信息
        self.summary["end_time"] = datetime.now().isoformat()
        self.summary["total_time"] = (datetime.now() - self.start_time).total_seconds()
        
        # 生成报告
        report = {
            "summary": self.summary,
            "metrics": self.metrics
        }
        
        # 保存报告
        with open(path, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        # 生成Markdown报告
        md_path = os.path.splitext(path)[0] + ".md"
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(f"# {self.name} 基准测试报告\n\n")
            f.write(f"## 测试摘要\n")
            f.write(f"- 开始时间：{self.summary['start_time']}\n")
            f.write(f"- 结束时间：{self.summary['end_time']}\n")
            f.write(f"- 总操作数：{self.summary['total_operations']}\n")
            f.write(f"- 总耗时：{self.summary['total_duration']:.2f}秒\n")
            f.write(f"- 平均内存使用：{self.summary['avg_memory_usage']:.2f}%\n")
            f.write(f"- 平均CPU使用：{self.summary['avg_cpu_usage']:.2f}%\n")
            f.write(f"- 缓存命中：{self.summary['cache_hits']}\n")
            f.write(f"- 缓存未命中：{self.summary['cache_misses']}\n\n")
            
            f.write("## 详细指标\n")
            for metric in self.metrics:
                f.write(f"### {metric['operation']}\n")
                f.write(f"- 时间戳：{metric['timestamp']}\n")
                f.write(f"- 批处理大小：{metric['batch_size']}\n")
                f.write(f"- 数据大小：{metric['data_size']}\n")
                f.write(f"- 耗时：{metric['duration']:.2f}秒\n")
                f.write(f"- 吞吐量：{metric['throughput']:.2f}项/秒\n")
                f.write(f"- 内存使用：{metric['memory_usage']:.2f}%\n")
                f.write(f"- CPU使用：{metric['cpu_usage']:.2f}%\n\n")

def generate_test_data(size: int, avg_length: int = 100) -> List[str]:
    """生成测试数据
    
    Args:
        size: 数据量
        avg_length: 平均文本长度
        
    Returns:
        测试文本列表
    """
    texts = []
    for i in range(size):
        length = int(np.random.normal(avg_length, 20))
        length = max(10, min(length, 200))  # 限制长度范围
        text = f"测试文本{i} " + "测试内容" * (length // 4)
        texts.append(text)
    return texts

@pytest.mark.benchmark
@pytest.mark.asyncio
async def test_add_texts_performance(benchmark_results_dir):
    """测试添加文本的性能"""
    # 初始化
    result = BenchmarkResult("添加文本性能测试")
    vector_store = VectorStoreOptimized(
        batch_size=32,
        max_workers=4,
        cache_size=1024
    )
    
    # 启动系统监控
    default_monitor.start()
    
    try:
        # 测试不同数据规模
        for data_size in [100, 500, 1000]:
            # 生成测试数据
            texts = generate_test_data(data_size)
            
            # 记录开始时间
            start_time = datetime.now()
            
            # 执行添加操作
            await vector_store.add_texts_async(texts)
            
            # 计算耗时
            duration = (datetime.now() - start_time).total_seconds()
            
            # 记录性能指标
            result.add_metric(
                operation="add_texts",
                batch_size=vector_store.batch_size,
                data_size=data_size,
                duration=duration,
                stats=vector_store.get_stats()
            )
            
            # 清理缓存
            vector_store.clear_cache()
            await asyncio.sleep(1)  # 等待系统状态恢复
        
        # 保存测试报告
        result.save_report(
            os.path.join(benchmark_results_dir, "add_texts_benchmark.json")
        )
    
    finally:
        default_monitor.stop()

@pytest.mark.benchmark
@pytest.mark.asyncio
async def test_search_performance(benchmark_results_dir):
    """测试搜索性能"""
    # 初始化
    result = BenchmarkResult("搜索性能测试")
    vector_store = VectorStoreOptimized(
        batch_size=32,
        max_workers=4,
        cache_size=1024
    )
    
    # 启动系统监控
    default_monitor.start()
    
    try:
        # 准备测试数据
        data_size = 1000
        texts = generate_test_data(data_size)
        await vector_store.add_texts_async(texts)
        
        # 测试不同的搜索参数
        for k in [5, 10, 20]:
            # 生成查询
            queries = generate_test_data(100, avg_length=20)
            
            # 记录开始时间
            start_time = datetime.now()
            
            # 执行搜索
            for query in queries:
                await vector_store.similarity_search_async(query, k=k)
            
            # 计算耗时
            duration = (datetime.now() - start_time).total_seconds()
            
            # 记录性能指标
            result.add_metric(
                operation=f"search_top_{k}",
                batch_size=1,
                data_size=len(queries),
                duration=duration,
                stats=vector_store.get_stats()
            )
            
            # 清理缓存
            vector_store.clear_cache()
            await asyncio.sleep(1)
        
        # 保存测试报告
        result.save_report(
            os.path.join(benchmark_results_dir, "search_benchmark.json")
        )
    
    finally:
        default_monitor.stop()

@pytest.mark.benchmark
@pytest.mark.asyncio
async def test_concurrent_performance(benchmark_results_dir):
    """测试并发性能"""
    # 初始化
    result = BenchmarkResult("并发性能测试")
    vector_store = VectorStoreOptimized(
        batch_size=32,
        max_workers=4,
        cache_size=1024
    )
    
    # 启动系统监控
    default_monitor.start()
    
    try:
        # 准备测试数据
        data_size = 1000
        texts = generate_test_data(data_size)
        await vector_store.add_texts_async(texts)
        
        # 测试不同的并发级别
        for concurrent_tasks in [5, 10, 20]:
            queries = generate_test_data(concurrent_tasks * 10, avg_length=20)
            
            # 创建并发任务
            tasks = []
            for query in queries:
                tasks.append(vector_store.similarity_search_async(query, k=5))
            
            # 记录开始时间
            start_time = datetime.now()
            
            # 并发执行
            await asyncio.gather(*tasks)
            
            # 计算耗时
            duration = (datetime.now() - start_time).total_seconds()
            
            # 记录性能指标
            result.add_metric(
                operation=f"concurrent_search_{concurrent_tasks}",
                batch_size=concurrent_tasks,
                data_size=len(queries),
                duration=duration,
                stats=vector_store.get_stats()
            )
            
            # 清理缓存
            vector_store.clear_cache()
            await asyncio.sleep(1)
        
        # 保存测试报告
        result.save_report(
            os.path.join(benchmark_results_dir, "concurrent_benchmark.json")
        )
    
    finally:
        default_monitor.stop()

@pytest.mark.benchmark
@pytest.mark.asyncio
async def test_memory_pressure(benchmark_results_dir):
    """测试内存压力"""
    # 初始化
    result = BenchmarkResult("内存压力测试")
    vector_store = VectorStoreOptimized(
        batch_size=32,
        max_workers=4,
        cache_size=1024,
        memory_limit=0.8  # 80%内存限制
    )
    
    # 启动系统监控
    default_monitor.start()
    
    try:
        # 准备大量测试数据
        data_sizes = [1000, 2000, 5000]
        
        for size in data_sizes:
            texts = generate_test_data(size, avg_length=200)  # 使用较长的文本
            
            # 记录开始时间
            start_time = datetime.now()
            
            # 执行添加操作
            await vector_store.add_texts_async(texts)
            
            # 计算耗时
            duration = (datetime.now() - start_time).total_seconds()
            
            # 记录性能指标
            result.add_metric(
                operation=f"memory_pressure_{size}",
                batch_size=vector_store.batch_size,
                data_size=size,
                duration=duration,
                stats=vector_store.get_stats()
            )
            
            # 执行一些搜索操作
            queries = generate_test_data(100, avg_length=20)
            search_start = datetime.now()
            
            for query in queries:
                await vector_store.similarity_search_async(query, k=5)
            
            search_duration = (datetime.now() - search_start).total_seconds()
            
            # 记录搜索性能指标
            result.add_metric(
                operation=f"memory_pressure_search_{size}",
                batch_size=1,
                data_size=len(queries),
                duration=search_duration,
                stats=vector_store.get_stats()
            )
            
            # 清理缓存
            vector_store.clear_cache()
            await asyncio.sleep(2)  # 给系统更多恢复时间
        
        # 保存测试报告
        result.save_report(
            os.path.join(benchmark_results_dir, "memory_pressure_benchmark.json")
        )
    
    finally:
        default_monitor.stop()

if __name__ == "__main__":
    # 创建输出目录
    os.makedirs("benchmark_results", exist_ok=True)
    
    try:
        # 运行所有基准测试
        asyncio.run(test_add_texts_performance("benchmark_results"))
        asyncio.run(test_search_performance("benchmark_results"))
        asyncio.run(test_concurrent_performance("benchmark_results"))
        asyncio.run(test_memory_pressure("benchmark_results"))
    finally:
        # 停止系统监控器
        default_monitor.stop() 