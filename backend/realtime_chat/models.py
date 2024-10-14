from django.db import models
from user_management.models import CustomUser

class Room(models.Model):
    name = models.CharField(max_length=128)
    online = models.ManyToManyField(to=CustomUser, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def get_online_count(self):
        return self.online.count()

    def join(self, user):
        self.online.add(user)
        self.save()

    def leave(self, user):
        self.online.remove(user)
        self.save()

    def __str__(self):
        return f'{self.name} ({self.get_online_count()})'

class Message(models.Model):
    user = models.ForeignKey(to=CustomUser, on_delete=models.CASCADE)
    room = models.ForeignKey(to=Room, on_delete=models.CASCADE)
    content = models.CharField(max_length=512)
    timestamp = models.DateTimeField(auto_now_add=True)
#
# class ChatRecord(models.Model):
#     user1 = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='chat_records_as_user1')
#     user2 = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='chat_records_as_user2')
#     messages = models.ManyToManyField(Message)
#
#     def __str__(self):
#         return f"Chat record between {self.user1.username} and {self.user2.username}"
