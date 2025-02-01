"""ScriptAI - 智能剧本创作平台."""

__version__ = "0.1.0"
__author__ = "ScriptAI Team"
__email__ = "team@scriptai.com"

from scriptai.config import settings
from scriptai.core import create_app

__all__ = ["create_app", "settings"] 