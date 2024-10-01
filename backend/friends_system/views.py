from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json

from user_management.models import CustomUser
from .models import FriendRequest

@csrf_exempt
def send_friend_request(request):
    user = request.user
    payload = {}
    if request.method == 'POST' and user.is_authenticated:
        user_id = request.POST.get("receiver_user_id")
        if user_id:
            receiver = CustomUser.objects.get(pk=user_id)
            try:
                # get all friend requests (active or inactive)
                friend_requests = FriendRequest.objects.filter(sender=user, receiver=receiver)

                # find if any of them are active
                try:
                    for request in friend_requests:
                        if request.is_active:
                            raise Exception("You already send them a friend request.")
                    # if none are active, then create a new friend request
                    friend_request = FriendRequest(sender=user, receiver=receiver)
                    friend_request.save()
                    payload['response'] = 'Friend request sent.'

                except Exception as e:
                    payload['response'] = str(e)
        except FriendRequest.DoesNotExist:
            # there are no friend requests found: create one
            friend_request = FriendRequest(sender=user, receiver=receiver)
            friend_request.save()
            payload['response'] = 'Friend request sent.'
        else:
            payload['response'] = 'Unable to send a friend request.'
    else:
        payload['response'] = 'You must be authenticated to send a friend request.'
    return HttpResponse(json.dumps(payload), content_type='application/json')
