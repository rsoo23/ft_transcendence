from channels.auth import UserLazyObject
from channels.middleware import BaseMiddleware
from channels.sessions import CookieMiddleware
from rest_framework_simplejwt.authentication import JWTAuthentication
from asgiref.sync import sync_to_async

def get_user(access_token):
    try:
        auth = JWTAuthentication()
        token = auth.get_validated_token(access_token)
        user = auth.get_user(token)

    except Exception as e:
        user = None

    return user

class JWTAuthMiddleware(BaseMiddleware):
    def populate_scope(self, scope):
        if 'Authorization' not in scope['subprotocols']:
            raise ValueError(
                'JWTAuthMiddleware could not find "Authorization" in scope.'
            )
        if scope['subprotocols'].index('Authorization') + 1 >= len(scope['subprotocols']):
            raise ValueError(
                'JWTAuthMiddleware access token missing after "Authorization" in scope.'
            )

        if 'token' not in scope:
            scope['token'] = scope['subprotocols'][scope['subprotocols'].index('Authorization') + 1]

        if 'user' not in scope:
            scope['user'] = UserLazyObject()

    async def resolve_scope(self, scope):
        scope['user']._wrapped = await sync_to_async(get_user)(scope['token'])

    async def __call__(self, scope, receive, send):
        scope = dict(scope)
        # Scope injection/mutation per this middleware's needs.
        self.populate_scope(scope)
        # Grab the finalized/resolved scope
        await self.resolve_scope(scope)

        return await super().__call__(scope, receive, send)

def JWTAuthMiddlewareStack(inner):
    return CookieMiddleware(JWTAuthMiddleware(inner))
