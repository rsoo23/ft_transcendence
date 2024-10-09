from django.db import models
from django.conf import settings
from django.utils import timezone
from user_management.models import CustomUser

class FriendList(models.Model):
    current_user                = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="user")
    friends                     = models.ManyToManyField(CustomUser, blank=True, related_name="friends")
    blocked_friends             = models.ManyToManyField(CustomUser, blank=True, related_name="blocked_friends")

    def add_friend(self, friend):
        if not friend in self.friends.all():
            self.friends.add(friend)

    def remove_friend(self, friend):
        if friend in self.friends.all():
            self.friends.remove(friend)

    def block_friend(self, friend):
        self.blocked_friends.add(friend)

    def unblock_friend(self, friend):
        if friend in self.blocked_friends.all():
            self.blocked_friends.remove(friend)

    # def unfriend(self, removee):
    #     # remove friend from remover's friend list
    #     self.remove_friend(removee)
    #
    #     # remove friend from removee's friend list
    #     removee_friend_list = FriendList.objects.get(user=removee)
    #     removee_friend_list.remove_friend(self.user)

    # def is_friend(self, friend):
    #     if friend in self.friends.all():
    #         return True
    #     return False

    def __str__(self):
        return self.current_user.username

class FriendRequest(models.Model):
    '''
    A friend request can have two parts:
        1. sender: the person who sends the request
        2. receiver: the person who receives the request
    is_active: False if accepted / declined
    '''
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="sender")
    receiver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="receiver")
    is_active = models.BooleanField(blank=True, null=False, default=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def accept(self):
        receiver_friend_list = FriendList.objects.get(current_user=self.receiver)
        if not receiver_friend_list:
            return
        receiver_friend_list.add_friend(self.sender)

        sender_friend_list = FriendList.objects.get(current_user=self.sender)
        if not sender_friend_list:
            return
        sender_friend_list.add_friend(self.receiver)
        self.is_active = False
        self.save()

    def decline(self):
        '''
        Decline the request sent to you
        '''
        self.is_active = False
        self.save()

    def cancel(self):
        '''
        Cancel the request you sent
        '''
        self.is_active = False
        self.save()

    def __str__(self):
        return self.sender.username
