from rest_framework import serializers
from .models import Transaction, TransactionImage

from djoser.serializers import UserCreateSerializer,PasswordSerializer

from django.contrib.auth.models import User

class CustomUserCreateSerializer(UserCreateSerializer):
    model = User
    class Meta(UserCreateSerializer.Meta):
        fields = ['id', 'username', 'email', 'password','first_name', 'last_name']

class CustomUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name']
    
    def validate_email(self, value):
        """Ensure email is unique across users (excluding current user)"""
        user = self.instance
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_first_name(self, value):
        """Ensure first name is not empty if provided"""
        if value is not None and value.strip() == '':
            raise serializers.ValidationError("First name cannot be empty.")
        return value
    
    def validate_last_name(self, value):
        """Ensure last name is not empty if provided"""
        if value is not None and value.strip() == '':
            raise serializers.ValidationError("Last name cannot be empty.")
        return value


class UserViewSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(max_length=150, read_only=True)
    email = serializers.EmailField(read_only=True)
    first_name = serializers.CharField(max_length=30, read_only=True)
    last_name = serializers.CharField(max_length=30, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

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
        if isinstance(validated_data, list):
            for item in validated_data:
                item['user'] = user
            return Transaction.objects.bulk_create([Transaction(**item) for item in validated_data])
        else:
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
    

class TransactionImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionImage
        fields = ['id', 'image']