from django.db import models

class Message(models.Model):
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

class ChatRecord(models.Model):
    user1 = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='chat_records_as_user1')
    user2 = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='chat_records_as_user2')
    messages = models.ManyToManyField(Message)

    def __str__(self):
        return f"Chat record between {self.user1.username} and {self.user2.username}"
