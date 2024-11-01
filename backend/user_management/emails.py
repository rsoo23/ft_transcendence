import smtplib
from email.message import EmailMessage
from main import settings

def send_email(email, otp):
    msg = EmailMessage()
    msg['Subject'] = 'Change Password OTP'
    msg['From'] = settings.BOT_GOOGLE_EMAIL
    msg['To'] = email
    msg.set_content(f'Your OTP for changing password is : {otp}')

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtpserver:
        smtpserver.login(settings.BOT_GOOGLE_EMAIL, settings.BOT_GOOGLE_EMAIL_APP_PASSWORD)
        smtpserver.send_message(msg)
        smtpserver.close()
