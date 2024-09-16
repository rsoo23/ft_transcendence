import smtplib
from email.message import EmailMessage

YOUR_GOOGLE_EMAIL = 'ChromaPong@gmail.com'  # The email you setup to send the email using app password
YOUR_GOOGLE_EMAIL_APP_PASSWORD = 'pybehamzhedcpcvh'  # The app password you generated

def send_email(email, otp):
    msg = EmailMessage()
    msg['Subject'] = 'ChromaPong 2FA OTP'
    msg['From'] = YOUR_GOOGLE_EMAIL
    msg['To'] = email
    msg.set_content(f'Otp For Chroma Pong is: {otp}')

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtpserver:
        smtpserver.login(YOUR_GOOGLE_EMAIL, YOUR_GOOGLE_EMAIL_APP_PASSWORD)
        smtpserver.send_message(msg)
        smtpserver.close()