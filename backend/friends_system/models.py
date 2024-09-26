from django.db import models
from django.conf import settings
from django.utils import timezone
from user_management.models import CustomUser

class FriendList(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="user")
    friends = models.ManyToManyField(CustomUser, blank=True, related_name="friends")

    def add_friend(self, account):
        if not account in self.friends.all():
            self.friends.add(account)

    def remove_friend(self, account):
        if account in self.friends.all():
            self.friends.remove(account)

    def unfriend(self, removee):
        # remove friend from remover's friend list
        self.remove_friend(removee)

        # remove friend from removee's friend list
        removee_friend_list = FriendList.objects.get(user=removee)
        removee_friend_list.remove_friend(self.user)

    def is_friend(self, friend):
        if friend in self.friends.all():
            return True
        return False

    def __str__(self):
        return self.user.username

