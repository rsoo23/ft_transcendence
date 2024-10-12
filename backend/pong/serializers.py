from rest_framework import serializers

class ObjectStateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    states = serializers.JSONField()
