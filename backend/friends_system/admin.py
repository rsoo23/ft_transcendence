from django.contrib import admin
from .models import FriendRequest, FriendList

class FriendListAdmin(admin.ModelAdmin):
    list_filter = ['current_user']
    list_display = ['current_user']
    search_fields = ['current_user']
    readonly_fields = ['current_user']

    class Meta:
        model = FriendList

class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'is_active', 'timestamp')  # Fields to display in the admin list view
    search_fields = ('sender__username', 'receiver__username')  # Enable search by sender and receiver usernames
    list_filter = ('is_active', 'timestamp')  # Filter by activity status and timestamp

admin.site.register(FriendList, FriendListAdmin)
admin.site.register(FriendRequest, FriendRequestAdmin)
