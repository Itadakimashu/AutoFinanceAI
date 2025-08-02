from django.db import models
from django.contrib.auth.models import User

from .constants import catagory_choices

# Create your models here.


class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    category = models.CharField(max_length=50, choices=catagory_choices)
    date = models.DateField()
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_recurring = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.description} - {self.amount} BDT"
    

class TransactionImage(models.Model):
    image = models.ImageField(upload_to='transaction_images/')
