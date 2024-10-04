from django.contrib import admin
from .models import FriendRequest, FriendList

class FriendListAdmin(admin.ModelAdmin):
    list_filter = ['current_user']
    list_display = ['current_user']
    search_fields = ['current_user']
    readonly_fields = ['current_user']

    class Meta:
        model = FriendList

admin.site.register(FriendList, FriendListAdmin)
