from rest_framework import serializers
from .models import Transaction

from djoser.serializers import UserCreateSerializer

from django.contrib.auth.models import User

class CustomUserCreateSerializer(UserCreateSerializer):
    model = User
    class Meta(UserCreateSerializer.Meta):
        fields = ['id', 'username', 'email', 'password','first_name', 'last_name']
    
class UserViewSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(max_length=150, read_only=True)
    email = serializers.EmailField(read_only=True)

    class Meta:
        fields = ['id', 'username', 'email']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'date', 'description', 'amount', 'category', 'is_recurring']

class TransactionViewSerializer(serializers.ModelSerializer):
    user = UserViewSerializer(read_only=True)
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'date', 'description', 'amount', 'category', 'is_recurring']

class TransactionCreateSerializer(serializers.ModelSerializer):
    date = serializers.DateField()
    class Meta:
        model = Transaction
        fields = ['date', 'description', 'amount', 'category', 'is_recurring']
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)

class TransactionUpdateSerializer(serializers.ModelSerializer):
    date = serializers.DateField(required=False)

    class Meta:
        model = Transaction
        fields = ['date', 'description', 'amount', 'category', 'is_recurring']
    
    def validate_amount(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value