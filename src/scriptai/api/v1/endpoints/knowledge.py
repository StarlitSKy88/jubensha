"""知识库管理相关的API端点."""
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from scriptai.core.security import get_current_active_superuser
from scriptai.db.session import get_db
from scriptai.services.rag.service import rag_service

router = APIRouter()


@router.post("/documents", status_code=status.HTTP_200_OK)
async def add_document(
    *,
    content: str,
    metadata: Optional[Dict[str, Any]] = None,
    current_user: User = Depends(get_current_active_superuser),
) -> Dict[str, Any]:
    """添加文档到知识库."""
    try:
        success = await rag_service.add_document(content)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="添加文档失败",
            )
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/documents/batch", status_code=status.HTTP_200_OK)
async def add_documents(
    *,
    documents: List[Dict[str, Any]],
    current_user: User = Depends(get_current_active_superuser),
) -> Dict[str, Any]:
    """批量添加文档到知识库."""
    try:
        success_count = 0
        for doc in documents:
            if await rag_service.add_document(
                doc["content"],
                metadata=doc.get("metadata"),
            ):
                success_count += 1
        return {
            "status": "success",
            "total": len(documents),
            "success": success_count,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/documents/upload", status_code=status.HTTP_200_OK)
async def upload_document(
    *,
    file: UploadFile = File(...),
    type: str = Query(..., description="文档类型，如theory、example、guideline等"),
    current_user: User = Depends(get_current_active_superuser),
) -> Dict[str, Any]:
    """上传文档文件到知识库."""
    try:
        # 读取文件内容
        content = await file.read()
        text = content.decode("utf-8")

        # 准备元数据
        metadata = {
            "type": type,
            "filename": file.filename,
            "content_type": file.content_type,
        }

        # 添加到知识库
        success = await rag_service.add_document(
            text,
            metadata=metadata,
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="添加文档失败",
            )
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.get("/search", status_code=status.HTTP_200_OK)
async def search_documents(
    *,
    query: str,
    limit: int = Query(5, ge=1, le=20),
    type: Optional[str] = Query(None, description="文档类型过滤"),
    current_user: User = Depends(get_current_active_user),
) -> List[Dict[str, Any]]:
    """搜索知识库文档."""
    try:
        # 准备过滤条件
        filter = {"type": type} if type else None

        # 执行搜索
        results = await rag_service.search(
            query=query,
            limit=limit,
            filter=filter,
        )

        # 转换结果
        return [
            {
                "content": result.content,
                "score": result.score,
                "metadata": result.metadata,
            }
            for result in results
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/suggestions/writing", status_code=status.HTTP_200_OK)
async def get_writing_suggestions(
    *,
    context: str,
    query: str,
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, str]:
    """获取写作建议."""
    try:
        suggestion = await rag_service.get_writing_suggestions(
            context=context,
            query=query,
        )
        return {"suggestion": suggestion}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/suggestions/character", status_code=status.HTTP_200_OK)
async def get_character_suggestions(
    *,
    description: str,
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, str]:
    """获取角色设计建议."""
    try:
        suggestion = await rag_service.get_character_suggestions(
            character_description=description,
        )
        return {"suggestion": suggestion}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/suggestions/plot", status_code=status.HTTP_200_OK)
async def get_plot_suggestions(
    *,
    description: str,
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, str]:
    """获取情节设计建议."""
    try:
        suggestion = await rag_service.get_plot_suggestions(
            plot_description=description,
        )
        return {"suggestion": suggestion}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/suggestions/dialogue", status_code=status.HTTP_200_OK)
async def get_dialogue_suggestions(
    *,
    dialogue: str,
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, str]:
    """获取对话优化建议."""
    try:
        suggestion = await rag_service.get_dialogue_suggestions(
            dialogue=dialogue,
        )
        return {"suggestion": suggestion}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/suggestions/scene", status_code=status.HTTP_200_OK)
async def get_scene_suggestions(
    *,
    description: str,
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, str]:
    """获取场景设计建议."""
    try:
        suggestion = await rag_service.get_scene_suggestions(
            scene_description=description,
        )
        return {"suggestion": suggestion}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/analysis/structure", status_code=status.HTTP_200_OK)
async def get_structure_analysis(
    *,
    content: str,
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, str]:
    """获取剧本结构分析."""
    try:
        analysis = await rag_service.get_structure_analysis(
            script_content=content,
        )
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) 