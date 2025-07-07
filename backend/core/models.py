from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Transaction(models.Model):
    catagory_choices = [
        ('income', 'Income'),
        ('food', 'Food'),
        ('transport', 'Transport'),
        ('utilities', 'Utilities'),
        ('entertainment', 'Entertainment'),
        ('health', 'Health'),
        ('education', 'Education'),
        ('clothing', 'Clothing'),
        ('housing', 'Housing'),
        ('savings', 'Savings'),
        ('investment', 'Investment'),
        ('miscellaneous', 'Miscellaneous'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    category = models.CharField(max_length=50, choices=catagory_choices)
    date = models.DateField(auto_now=True)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_recurring = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.description} - {self.amount} BDT"
