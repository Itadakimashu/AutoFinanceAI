import re
from datetime import datetime
from decimal import Decimal


def parse_transaction_from_text(extracted_text_list):
    """
    Parse extracted text from receipt and convert to individual transaction items
    
    Args:
        extracted_text_list (list): List of text items from OCR
        
    Returns:
        list: List of parsed transaction data for each item
    """
    transactions = []
    
    # Extract basic info that applies to all transactions
    receipt_date = extract_date(extracted_text_list)
    merchant_name = extract_description(extracted_text_list)
    
    # Extract individual line items
    line_items = extract_line_items(extracted_text_list)
    
    # Create transaction for each line item
    for item in line_items:
        transaction_data = {
            'category': 'food',  # Since these are food receipts
            'date': receipt_date,
            'description': f"{merchant_name} - {item['description']}",
            'amount': item['amount']
        }
        transactions.append(transaction_data)
    
    return transactions


def extract_line_items(text_list):
    """
    Extract individual purchased items with their prices
    """
    line_items = []
    
    # Find all price positions first
    price_positions = []
    for i, text in enumerate(text_list):
        if is_price_format(text):
            price_positions.append(i)
    
    # For each price, look backwards for quantity and description
    for price_pos in price_positions:
        price_text = text_list[price_pos]
        price = extract_amount_from_string(price_text)
        
        if not price:
            continue
        
        # Look backwards from price to find quantity (1, 2, etc.) and description
        description_parts = []
        found_quantity = False
        
        # Check a few positions before the price
        for j in range(max(0, price_pos - 6), price_pos):
            current_text = text_list[j]
            
            # If we find a quantity marker, collect everything after it until price
            if current_text.isdigit() and current_text in ["1", "2", "3", "4", "5"] and not found_quantity:
                # Collect description from after quantity to before price
                for k in range(j + 1, price_pos):
                    desc_text = text_list[k]
                    if not is_receipt_code(desc_text):
                        description_parts.append(desc_text)
                found_quantity = True
                break
        
        # If we found a description, create the line item
        if description_parts and found_quantity:
            item_description = " ".join(description_parts)
            line_items.append({
                'description': item_description,
                'amount': price
            })
    
    # Fallback: if no line items found, try to create at least one from largest price
    if not line_items and price_positions:
        # Find the largest price
        largest_price = None
        largest_price_pos = -1
        
        for pos in price_positions:
            price = extract_amount_from_string(text_list[pos])
            if price and (largest_price is None or price > largest_price):
                largest_price = price
                largest_price_pos = pos
        
        if largest_price:
            # Get description from nearby text
            description_parts = []
            
            # Look for meaningful text around the price
            start_pos = max(0, largest_price_pos - 10)
            end_pos = min(len(text_list), largest_price_pos + 3)
            
            for i in range(start_pos, largest_price_pos):
                text = text_list[i]
                if (not is_receipt_code(text) and 
                    not text.isdigit() and 
                    len(text) > 1 and 
                    text.isalpha()):
                    description_parts.append(text)
            
            # Take the last few meaningful words as description
            if description_parts:
                description = " ".join(description_parts[-3:])
            else:
                description = "Purchase"
            
            line_items.append({
                'description': description,
                'amount': largest_price
            })
    
    return line_items
    


def is_price_format(text):
    """
    Check if text looks like a price (e.g., $14.98, 12.50, 750.00, 7200)
    """
    # Check for dollar sign followed by digits and decimal
    if re.match(r'^\$?\d+\.\d{2}$', text):
        return True
    
    # Check for large numbers that could be prices (like 750.00, 7200)
    if re.match(r'^\d{3,}\.?\d*$', text):
        try:
            value = float(text)
            # Consider it a price if it's a reasonable amount (between $1 and $10000)
            return 1 <= value <= 10000
        except:
            return False
    
    return False


def is_receipt_code(text):
    """
    Check if text is a receipt code/header that should be skipped
    """
    skip_patterns = [
        r'^#:', r'BATCH', r'APPR', r'TRACE', r'VISA', r'\d{4}$',
        r'SALE', r'AM$', r'PM$', r'SUBTOTAL:', r'TAX:', r'TOTAL:', r'TIP:',
        r'^\d{1,2}/\d{1,2}/\d{4}$', r'^\d{1,2}:\d{2}$', r'^CHICAGO', r'^IL$',
        r'APPROVED', r'THANK', r'CUSTOMER', r'COPY', r'BLVD$', r'GREEN$', r'0AKS$',
        # Invoice-specific terms
        r'INVOICE', r'GST', r'SGST', r'PVT', r'LTD', r'PHONE', r'EMAIL', r'PLOT',
        r'DISCOUNT', r'TAXABLE', r'CASH', r'RUPEES', r'HUNDRED', r'ONLY',
        r'^\d{5,}$',  # Long numbers (phone, invoice numbers)
        r'@', r'\.COM$', r'GMAIL'  # Email parts
    ]
    
    for pattern in skip_patterns:
        if re.search(pattern, text.upper()):
            return True
    return False


def extract_date(text_list):
    """
    Extract date from receipt text
    """
    date_patterns = [
        r'\d{1,2}/\d{1,2}/\d{4}',  # MM/DD/YYYY or M/D/YYYY
        r'\d{1,2}-\d{1,2}-\d{4}',  # MM-DD-YYYY
        r'\d{4}/\d{1,2}/\d{1,2}',  # YYYY/MM/DD
    ]
    
    for text_item in text_list:
        for pattern in date_patterns:
            match = re.search(pattern, text_item)
            if match:
                date_str = match.group()
                try:
                    # Try different date formats
                    for date_format in ['%m/%d/%Y', '%m-%d-%Y', '%Y/%m/%d']:
                        try:
                            parsed_date = datetime.strptime(date_str, date_format)
                            return parsed_date.date()
                        except ValueError:
                            continue
                except ValueError:
                    continue
    
    return None


def extract_total_amount(text_list):
    """
    Extract the total amount from receipt text
    """
    # Look for "TOTAL:" followed by amount
    for i, text_item in enumerate(text_list):
        if text_item.upper() == "TOTAL:" and i + 1 < len(text_list):
            next_item = text_list[i + 1]
            amount = extract_amount_from_string(next_item)
            if amount:
                return amount
    
    # Alternative: look for currency patterns near "TOTAL"
    total_pattern = r'TOTAL[:\s]*\$?(\d+\.?\d*)'
    full_text = " ".join(text_list)
    match = re.search(total_pattern, full_text, re.IGNORECASE)
    if match:
        try:
            return Decimal(match.group(1))
        except:
            pass
    
    return None


def extract_amount_from_string(text):
    """
    Extract decimal amount from a string
    """
    # Remove $ and other currency symbols, extract number
    if text.startswith('$'):
        amount_text = text[1:]
    else:
        amount_text = text
    
    try:
        # Handle cases like "7200" (assume it's 7200.00)
        if '.' not in amount_text and len(amount_text) >= 3:
            # For large numbers without decimals, treat as whole currency units
            return Decimal(amount_text + '.00')
        else:
            return Decimal(amount_text)
    except:
        return None


def extract_description(text_list):
    """
    Extract merchant/restaurant name from receipt
    Usually appears at the top of the receipt
    """
    # Take first few non-empty meaningful text items as merchant name
    merchant_parts = []
    
    # Skip common receipt headers and look for actual business name
    skip_patterns = [
        r'^\d+$',  # Pure numbers
        r'^[A-Z]{1,2}$',  # Single/double letters
        r'SALE', r'BATCH', r'APPR', r'TRACE', r'VISA'
    ]
    
    for i, text_item in enumerate(text_list):
        if i > 10:  # Don't look too far down
            break
            
        # Skip if matches skip patterns
        if any(re.match(pattern, text_item.upper()) for pattern in skip_patterns):
            continue
            
        # Skip if it's just numbers or very short
        if text_item.isdigit() or len(text_item.strip()) < 2:
            continue
            
        merchant_parts.append(text_item)
        
        # Stop after getting a few meaningful parts
        if len(merchant_parts) >= 3:
            break
    
    if merchant_parts:
        return " ".join(merchant_parts)
    
    return "Unknown Merchant"


def format_transaction_display(transactions_list):
    """
    Format transaction data for display
    """
    print("\n" + "="*50)
    print(f"PARSED TRANSACTIONS ({len(transactions_list)} items):")
    print("="*50)
    
    for i, transaction_data in enumerate(transactions_list, 1):
        print(f"\n--- Transaction {i} ---")
        print(f"Category: {transaction_data['category']}")
        print(f"Date: {transaction_data['date']}")
        print(f"Description: {transaction_data['description']}")
        print(f"Amount: ${transaction_data['amount']}")
    
    print("\n" + "="*50)


def test_parser():
    """
    Test the parser with sample data
    """
    # Sample extracted text (based on your output)
    sample_text = [
        "HARBOR", "LANE", "CAFE", "3941", "GREEN", "0AKS", "BLVD", 
        "CHICAGO,", "IL", "SALE", "11/20/2019", "11:05", "AM", 
        "BATCH", "#:01A2A", "APPR", "#:34362", "TRACE", "#", "8", 
        "VISA", "3483", "1", "Tacos", "Del", "Mal", "Shrimp", "$14.98", 
        "1", "Especial", "Salad", "Chicken", "$12.50", "1", "Fountain", 
        "Beverage", "$1.99", "SUBTOTAL:", "$29.47", "TAX:", "$1.92", 
        "TOTAL:", "$31.39", "TIP:", "TOTAL:", "APPROVED", "THANK", 
        "YoU", "CUSTOMER", "COPY"
    ]
    
    result = parse_transaction_from_text(sample_text)
    format_transaction_display(result)
    return result


if __name__ == "__main__":
    test_parser()
