import json
from decimal import Decimal

from django.conf import settings
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError

from core.models import Transaction

DEFAULT_DATA_PATH = settings.BASE_DIR / "data" / "transactions.json"


class Command(BaseCommand):
    help = (
        "Load the curated, realistic (Bangladeshi Taka) sample transactions "
        "from data/transactions.json for a given user. Unlike "
        "generate_fake_transactions, this uses a fixed, hand-written dataset "
        "instead of randomly generated data."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--user",
            type=str,
            required=True,
            help="Username to load the sample transactions for",
        )
        parser.add_argument(
            "--file",
            type=str,
            default=str(DEFAULT_DATA_PATH),
            help=f"Path to the transactions JSON file (default: {DEFAULT_DATA_PATH})",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear the user's existing transactions before loading",
        )

    def handle(self, *args, **options):
        username = options["user"]
        file_path = options["file"]
        clear_existing = options["clear"]

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise CommandError(f'User "{username}" does not exist')

        try:
            with open(file_path, encoding="utf-8") as data_file:
                records = json.load(data_file)
        except FileNotFoundError:
            raise CommandError(f"Could not find transactions file at {file_path}")
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {file_path}: {exc}")

        if clear_existing:
            deleted_count = Transaction.objects.filter(user=user).count()
            Transaction.objects.filter(user=user).delete()
            self.stdout.write(f"Cleared {deleted_count} existing transactions for {username}")

        transactions = [
            Transaction(
                user=user,
                date=record["date"],
                description=record["description"],
                amount=Decimal(str(record["amount"])),
                category=record["category"],
                is_recurring=record.get("is_recurring", False),
            )
            for record in records
        ]

        Transaction.objects.bulk_create(transactions)

        self.stdout.write(
            self.style.SUCCESS(
                f"Loaded {len(transactions)} sample transactions for {username} "
                f"from {file_path}"
            )
        )
        self.stdout.write(
            f"Total transactions for {username}: "
            f"{Transaction.objects.filter(user=user).count()}"
        )
