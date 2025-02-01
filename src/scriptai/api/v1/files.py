"""文件服务API."""
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from scriptai.core.security import get_current_user
from scriptai.db.session import get_db
from scriptai.models.user import User
from scriptai.services.storage import storage_service

router = APIRouter(
    prefix="/files",
    tags=["文件服务"],
    responses={
        401: {"description": "未认证"},
        403: {"description": "权限不足"},
        404: {"description": "文件不存在"},
        500: {"description": "服务器内部错误"}
    }
)

@router.post(
    "/upload",
    response_model=dict,
    summary="上传文件",
    description="""
    上传文件到服务器。
    
    - 如果未指定存储路径，文件将存储在用户的个人目录下
    - 支持分块上传大文件
    - 自动创建存储目录
    """
)
async def upload_file(
    file: UploadFile = File(...),
    path: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """上传文件.
    
    Args:
        file: 上传的文件
        path: 存储路径，可选，默认存储在用户个人目录
        
    Returns:
        包含文件URL的字典
        
    Raises:
        401: 未认证
        500: 文件上传失败
    
    Examples:
        >>> response = await upload_file(
        ...     file=my_file,
        ...     path="documents/report.pdf"
        ... )
        >>> print(response)
        {"url": "/uploads/documents/report.pdf"}
    """
    try:
        # 如果没有指定路径，使用默认路径
        if not path:
            path = f"files/{current_user.id}/{file.filename}"
            
        url = await storage_service.upload_file(file, path)
        return {"url": url}
    except IOError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get(
    "/{path:path}",
    response_class=FileResponse,
    summary="获取文件",
    description="获取指定路径的文件内容"
)
async def get_file(path: str):
    """获取文件.
    
    Args:
        path: 文件路径
        
    Returns:
        文件内容
        
    Raises:
        404: 文件不存在
        500: 服务器内部错误
    """
    file_path = storage_service.get_file_path(f"/uploads/{path}")
    if not file_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="文件不存在"
        )
        
    return FileResponse(file_path)

@router.delete(
    "/{path:path}",
    summary="删除文件",
    description="""
    删除指定路径的文件。
    
    - 只能删除自己上传的文件
    - 删除成功返回成功消息
    - 如果文件不存在返回404错误
    """
)
async def delete_file(
    path: str,
    current_user: User = Depends(get_current_user)
):
    """删除文件.
    
    Args:
        path: 文件路径
        
    Returns:
        成功消息
        
    Raises:
        401: 未认证
        403: 无权删除此文件
        404: 文件不存在
        500: 服务器内部错误
    """
    # 检查文件是否属于当前用户
    if not path.startswith(f"files/{current_user.id}/"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权删除此文件"
        )
        
    success = await storage_service.delete_file(f"/uploads/{path}")
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="文件不存在"
        )
        
    return {"message": "文件已删除"} 