from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from faker import Faker
from core.models import Transaction
import random
from datetime import datetime, timedelta
from decimal import Decimal

class Command(BaseCommand):
    help = 'Generate fake transactions for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=100,
            help='Number of fake transactions to create (default: 100)'
        )
        parser.add_argument(
            '--user',
            type=str,
            help='Username for which to create transactions (if not provided, creates for all users)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing transactions before creating new ones'
        )

    def handle(self, *args, **options):
        fake = Faker()
        count = options['count']
        username = options.get('user')
        clear_existing = options['clear']

        # Get users
        if username:
            try:
                users = [User.objects.get(username=username)]
                self.stdout.write(f"Creating transactions for user: {username}")
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'User "{username}" does not exist')
                )
                return
        else:
            users = User.objects.all()
            if not users:
                self.stdout.write(
                    self.style.ERROR('No users found. Please create at least one user first.')
                )
                return
            self.stdout.write(f"Creating transactions for {users.count()} user(s)")

        # Clear existing transactions if requested
        if clear_existing:
            if username:
                deleted_count = Transaction.objects.filter(user__username=username).count()
                Transaction.objects.filter(user__username=username).delete()
            else:
                deleted_count = Transaction.objects.count()
                Transaction.objects.all().delete()
            self.stdout.write(f"Cleared {deleted_count} existing transactions")

        # Transaction categories
        categories = [
            'income', 'food', 'transport', 'utilities', 'entertainment',
            'health', 'education', 'clothing', 'housing', 'savings',
            'investment', 'miscellaneous'
        ]

        # Income descriptions
        income_descriptions = [
            'Salary payment', 'Freelance project', 'Bonus payment', 'Investment returns',
            'Side hustle income', 'Consultation fee', 'Part-time job', 'Commission earned',
            'Dividend payment', 'Rental income'
        ]

        # Expense descriptions by category
        expense_descriptions = {
            'food': [
                'Grocery shopping', 'Restaurant dinner', 'Coffee shop', 'Fast food lunch',
                'Home delivery', 'Bakery items', 'Fruit market', 'Dinner with friends',
                'Office lunch', 'Weekend brunch'
            ],
            'transport': [
                'Bus fare', 'Uber ride', 'Gas station', 'Car maintenance', 'Taxi fare',
                'Train ticket', 'Parking fee', 'Car insurance', 'Vehicle registration',
                'Auto repair'
            ],
            'utilities': [
                'Electricity bill', 'Water bill', 'Internet bill', 'Phone bill',
                'Gas bill', 'Cable TV', 'Trash collection', 'Home insurance',
                'Security system', 'Maintenance fee'
            ],
            'entertainment': [
                'Movie tickets', 'Concert tickets', 'Gaming subscription', 'Netflix subscription',
                'Sports event', 'Theme park', 'Book purchase', 'Museum visit',
                'Music streaming', 'Video games'
            ],
            'health': [
                'Doctor visit', 'Pharmacy', 'Dental checkup', 'Gym membership',
                'Health insurance', 'Medical tests', 'Vitamins', 'Eye checkup',
                'Physical therapy', 'Hospital bill'
            ],
            'education': [
                'Course fee', 'Book purchase', 'Online course', 'Tuition fee',
                'Certification exam', 'Workshop fee', 'Training materials', 'School supplies',
                'Language classes', 'Skill development'
            ],
            'clothing': [
                'New shirt', 'Shoes purchase', 'Winter coat', 'Formal wear',
                'Casual outfit', 'Accessories', 'Seasonal clothes', 'Work attire',
                'Sports wear', 'Fashion items'
            ],
            'housing': [
                'Rent payment', 'Mortgage payment', 'Home repair', 'Furniture purchase',
                'Appliance repair', 'Garden maintenance', 'Home decoration', 'Cleaning supplies',
                'Property tax', 'Home improvement'
            ],
            'savings': [
                'Emergency fund', 'Vacation savings', 'Future planning', 'Retirement fund',
                'Goal savings', 'Investment savings', 'Education fund', 'Health fund',
                'House down payment', 'Car savings'
            ],
            'investment': [
                'Stock purchase', 'Mutual fund', 'Crypto investment', 'Bond purchase',
                'Real estate investment', 'Gold purchase', 'Fixed deposit', 'SIP investment',
                'Portfolio diversification', 'Long-term investment'
            ],
            'miscellaneous': [
                'Gift purchase', 'Charity donation', 'Pet expenses', 'Hobby supplies',
                'Travel expenses', 'Subscription renewal', 'Emergency expense', 'Unexpected cost',
                'Personal care', 'Other expenses'
            ]
        }

        transactions_created = 0
        
        for user in users:
            user_transactions = count // len(users)
            if user == users[0]:  # Give remainder to first user
                user_transactions += count % len(users)

            self.stdout.write(f"Creating {user_transactions} transactions for {user.username}...")

            for _ in range(user_transactions):
                # Random date within last 2 years
                start_date = datetime.now() - timedelta(days=730)
                end_date = datetime.now()
                random_date = fake.date_between(start_date=start_date, end_date=end_date)

                # Random category
                category = random.choice(categories)

                # Generate description based on category
                if category == 'income':
                    description = random.choice(income_descriptions)
                    # Income amounts: 20,000 to 150,000 BDT
                    amount = Decimal(random.randint(20000, 150000))
                else:
                    description = random.choice(expense_descriptions[category])
                    # Expense amounts based on category
                    if category in ['housing', 'education']:
                        # Higher amounts for housing and education
                        amount = Decimal(random.randint(5000, 50000))
                    elif category in ['utilities', 'health', 'transport']:
                        # Medium amounts
                        amount = Decimal(random.randint(1000, 15000))
                    elif category in ['food', 'entertainment', 'clothing']:
                        # Lower to medium amounts
                        amount = Decimal(random.randint(200, 8000))
                    elif category in ['savings', 'investment']:
                        # Variable amounts for savings/investment
                        amount = Decimal(random.randint(2000, 25000))
                    else:  # miscellaneous
                        amount = Decimal(random.randint(100, 10000))

                # Random recurring (10% chance)
                is_recurring = random.random() < 0.1

                # Create transaction
                Transaction.objects.create(
                    user=user,
                    date=random_date,
                    category=category,
                    description=description,
                    amount=amount,
                    is_recurring=is_recurring
                )
                transactions_created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {transactions_created} fake transactions!'
            )
        )
        
        # Show some statistics
        total_transactions = Transaction.objects.count()
        self.stdout.write(f'Total transactions in database: {total_transactions}')
        
        for user in users:
            user_count = Transaction.objects.filter(user=user).count()
            self.stdout.write(f'{user.username}: {user_count} transactions')
