from rest_framework import serializers
from .models import Category, Transaction

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class CategoryViewSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField()
    class Meta:
        model = Category
        fields = ['id', 'name']

class UserViewSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(max_length=150, read_only=True)
    email = serializers.EmailField(read_only=True)

    class Meta:
        fields = ['id', 'username', 'email']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'date', 'description', 'amount', 'category', 'is_income', 'is_recurring']

class TransactionViewSerializer(serializers.ModelSerializer):
    user = UserViewSerializer(read_only=True)
    category = CategoryViewSerializer(read_only=True)
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'date', 'description', 'amount', 'category', 'is_income', 'is_recurring']

class TransactionCreateSerializer(serializers.ModelSerializer):
    category =  serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=False, allow_null=True
    )
    date = serializers.DateField()
    class Meta:
        model = Transaction
        fields = ['user', 'date', 'description', 'amount', 'category', 'is_income', 'is_recurring']

class TransactionUpdateSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=False, allow_null=True
    )
    date = serializers.DateField(required=False)

    class Meta:
        model = Transaction
        fields = ['date', 'description', 'amount', 'category', 'is_income', 'is_recurring']