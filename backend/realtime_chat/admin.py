from django.contrib import admin

from .models import Room, Message

# Register your models here.

class RoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_users', 'timestamp')

    def display_users(self, obj):
        return ', '.join([user.username for user in obj.users.all()])

class MessageAdmin(admin.ModelAdmin):
    list_display = ('user', 'room', 'content', 'timestamp')

admin.site.register(Room, RoomAdmin)
admin.site.register(Message, MessageAdmin)
