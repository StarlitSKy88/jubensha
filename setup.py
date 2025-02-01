"""Setup script for the scriptai package."""

import os
from setuptools import setup, find_packages

# 读取README.md作为长描述
with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

# 读取requirements.txt中的依赖
def read_requirements(filename):
    """Read requirements from file."""
    with open(filename, "r", encoding="utf-8") as file:
        return [line.strip() for line in file if line.strip() and not line.startswith("#")]

# 获取所有依赖
install_requires = read_requirements("requirements.txt")
dev_requires = read_requirements("requirements-dev.txt")

setup(
    name="scriptai",
    version="0.1.0",
    author="ScriptAI Team",
    author_email="team@scriptai.com",
    description="智能剧本创作平台",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/scriptai",
    project_urls={
        "Bug Tracker": "https://github.com/yourusername/scriptai/issues",
        "Documentation": "https://scriptai.readthedocs.io/",
    },
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    python_requires=">=3.10",
    install_requires=install_requires,
    extras_require={
        "dev": dev_requires,
        "test": [
            "pytest>=8.0.0",
            "pytest-cov>=4.1.0",
            "pytest-asyncio>=0.23.0",
        ],
        "docs": [
            "mkdocs>=1.5.0",
            "mkdocs-material>=9.5.0",
            "mkdocstrings[python]>=0.24.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "scriptai=scriptai.cli:main",
        ],
    },
    include_package_data=True,
    zip_safe=False,
) 