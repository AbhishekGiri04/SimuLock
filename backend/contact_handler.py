import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ContactHandler:
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.smtp_user = os.getenv('SMTP_USER', 'abhishekgiri1978@gmail.com')
        self.smtp_pass = os.getenv('SMTP_PASS', 'your_gmail_app_password_here')
        self.from_email = os.getenv('FROM_EMAIL', 'SimuLock <abhishekgiri1978@gmail.com>')
        self.to_email = os.getenv('TO_EMAIL', 'abhishekgiri1978@gmail.com')

    def send_contact_email(self, name, email, subject, message):
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = self.from_email
            msg['To'] = self.to_email
            msg['Subject'] = f"SimuLock Contact: {subject}" if subject else "SimuLock Contact Form"

            # HTML email body
            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; }}
                    .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; }}
                    .header {{ background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; }}
                    .header h1 {{ margin: 0; font-size: 28px; font-weight: bold; }}
                    .header p {{ margin: 5px 0 0 0; opacity: 0.9; }}
                    .content {{ padding: 30px; }}
                    .field {{ margin-bottom: 20px; }}
                    .label {{ font-weight: 600; color: #374151; margin-bottom: 5px; display: block; }}
                    .value {{ background: #f9fafb; padding: 12px; border-radius: 8px; border-left: 4px solid #3b82f6; }}
                    .message-box {{ background: #f0f9ff; padding: 20px; border-radius: 8px; border: 1px solid #bae6fd; margin-top: 10px; }}
                    .footer {{ background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }}
                    .timestamp {{ color: #9ca3af; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔒 SimuLock</h1>
                        <p>New Contact Form Submission</p>
                    </div>
                    <div class="content">
                        <div class="field">
                            <span class="label">👤 Contact Name:</span>
                            <div class="value">{name}</div>
                        </div>
                        <div class="field">
                            <span class="label">📧 Email Address:</span>
                            <div class="value">{email}</div>
                        </div>
                        <div class="field">
                            <span class="label">📋 Subject:</span>
                            <div class="value">{subject if subject else 'No subject provided'}</div>
                        </div>
                        <div class="field">
                            <span class="label">💬 Message:</span>
                            <div class="message-box">{message}</div>
                        </div>
                    </div>
                    <div class="footer">
                        <p><strong>SimuLock - Deadlock Detection Simulator</strong></p>
                        <p class="timestamp">Received: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
                        <p>This message was sent through the SimuLock contact form.</p>
                    </div>
                </div>
            </body>
            </html>
            """

            # Plain text fallback
            text_body = f"""
            SimuLock - New Contact Form Submission
            
            Contact Name: {name}
            Email Address: {email}
            Subject: {subject if subject else 'No subject provided'}
            
            Message:
            {message}
            
            ---
            Received: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
            SimuLock - Deadlock Detection Simulator
            """

            # Attach both HTML and plain text
            msg.attach(MIMEText(text_body, 'plain'))
            msg.attach(MIMEText(html_body, 'html'))

            # Send email
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_pass)
            server.send_message(msg)
            server.quit()

            return {"success": True, "message": "Email sent successfully"}

        except Exception as e:
            return {"success": False, "message": f"Failed to send email: {str(e)}"}