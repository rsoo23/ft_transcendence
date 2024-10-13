from django.db import models
from user_management.models import CustomUser

class Room(models.Model):
    name = models.CharField(max_length=255, unique=True, blank=False,)
    users = models.ManyToManyField(to=CustomUser, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def join(self, user):
        '''
        Returns True if user is added to the users list
        '''
        is_user_added = False
        if not user in self.users.all():
            self.users.add(user)
            self.save()
            is_user_added = True
        elif user in self.users.all():
            is_user_added = True
        return is_user_added

    def leave(self, user):
        '''
        Returns True if user is removed from the users list
        '''
        is_user_removed = False
        if user in self.users.all():
            self.users.remove(user)
            self.save()
            is_user_removed = True
        return is_user_removed

    def __str__(self):
        return f'{self.name}'

class MessageManager(models.Manager):
    def by_room(self, room):
        query_set = Room.object.filter(room=room).order_by("-timestamp")
        return query_set

class Message(models.Model):
    user = models.ForeignKey(to=CustomUser, on_delete=models.CASCADE)
    room = models.ForeignKey(to=Room, on_delete=models.CASCADE)
    content = models.TextField(unique=False, blank=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    objects = MessageManager()

    def __str__(self):
        return self.content
