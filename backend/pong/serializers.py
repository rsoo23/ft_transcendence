from rest_framework import serializers

class Vector2Serializer(serializers.Serializer):
    x = serializers.IntegerField()
    y = serializers.IntegerField()

class StateSerializer(serializers.Serializer):
    pos = Vector2Serializer()
    alpha = serializers.IntegerField()

class ObjectStateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    states = StateSerializer(many=True)
