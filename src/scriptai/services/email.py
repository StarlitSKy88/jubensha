"""邮件服务."""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional

from fastapi import BackgroundTasks
from jinja2 import Environment, PackageLoader

from scriptai.config import settings

class EmailService:
    """邮件服务类."""
    
    def __init__(self):
        """初始化邮件服务."""
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.sender = settings.SMTP_SENDER
        
        # 加载邮件模板
        self.env = Environment(
            loader=PackageLoader('scriptai', 'templates/email')
        )
        
    async def send_email(
        self,
        to_email: str,
        subject: str,
        template_name: str,
        template_data: dict,
        cc: Optional[List[str]] = None,
        background_tasks: Optional[BackgroundTasks] = None
    ) -> None:
        """发送邮件.
        
        Args:
            to_email: 收件人邮箱
            subject: 邮件主题
            template_name: 模板名称
            template_data: 模板数据
            cc: 抄送列表
            background_tasks: 后台任务
        """
        # 渲染模板
        template = self.env.get_template(f"{template_name}.html")
        html_content = template.render(**template_data)
        
        # 创建邮件
        message = MIMEMultipart()
        message["From"] = self.sender
        message["To"] = to_email
        message["Subject"] = subject
        
        if cc:
            message["Cc"] = ", ".join(cc)
            
        # 添加HTML内容
        message.attach(MIMEText(html_content, "html"))
        
        # 发送邮件
        if background_tasks:
            background_tasks.add_task(
                self._send_email_background,
                message,
                to_email,
                cc
            )
        else:
            await self._send_email_background(message, to_email, cc)
            
    async def _send_email_background(
        self,
        message: MIMEMultipart,
        to_email: str,
        cc: Optional[List[str]] = None
    ) -> None:
        """后台发送邮件.
        
        Args:
            message: 邮件消息
            to_email: 收件人邮箱
            cc: 抄送列表
        """
        recipients = [to_email]
        if cc:
            recipients.extend(cc)
            
        with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            server.sendmail(self.sender, recipients, message.as_string())
            
    async def send_verification_email(
        self,
        to_email: str,
        verification_url: str,
        background_tasks: Optional[BackgroundTasks] = None
    ) -> None:
        """发送验证邮件.
        
        Args:
            to_email: 收件人邮箱
            verification_url: 验证链接
            background_tasks: 后台任务
        """
        template_data = {
            "verification_url": verification_url
        }
        
        await self.send_email(
            to_email=to_email,
            subject="邮箱验证",
            template_name="verification",
            template_data=template_data,
            background_tasks=background_tasks
        )
        
    async def send_password_reset_email(
        self,
        to_email: str,
        reset_url: str,
        background_tasks: Optional[BackgroundTasks] = None
    ) -> None:
        """发送密码重置邮件.
        
        Args:
            to_email: 收件人邮箱
            reset_url: 重置链接
            background_tasks: 后台任务
        """
        template_data = {
            "reset_url": reset_url
        }
        
        await self.send_email(
            to_email=to_email,
            subject="密码重置",
            template_name="password_reset",
            template_data=template_data,
            background_tasks=background_tasks
        )

# 全局邮件服务实例
email_service = EmailService() 