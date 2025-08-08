

from fpdf import FPDF
from fpdf.enums import XPos, YPos
from datetime import datetime
import os


class TransactionPDF(FPDF):
    def header(self):
        """Add header to each page"""
        self.set_font('Helvetica', 'B', 16)
        self.cell(0, 10, 'Auto Finance AI Monthly Transcript', border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
        
        # Add motto
        self.set_font('Helvetica', 'I', 10)
        self.cell(0, 6, '- Smarter Budgets, Better Habits.', border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
        self.ln(8)
    
    def footer(self):
        """Add footer to each page"""
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', border=0, new_x=XPos.RIGHT, new_y=YPos.TOP, align='C')


def create_transaction_pdf(transactions, filename=None):
    """
    Creates a PDF report from transaction data with a formatted table.
    
    Args:
        transactions (list): List of transaction dictionaries with keys: date, description, amount, category
        filename (str): Optional filename (not used, kept for compatibility)
    
    Returns:
        bytes: PDF data as bytes
    """
    
    if not transactions:
        raise ValueError("No transactions provided")
    
    # Generate filename if not provided
    if not filename:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"transaction_report_{timestamp}.pdf"
    
    # Ensure filename has .pdf extension
    if not filename.endswith('.pdf'):
        filename += '.pdf'
    
    # Create PDF instance
    pdf = TransactionPDF()
    pdf.add_page()
    
    # Title
    pdf.set_font('Helvetica', 'B', 14)
    pdf.cell(0, 10, f"Transactions from {transactions[0].get('date')} to {transactions[-1].get('date')}", border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
    pdf.ln(5)
    
    # Report generation date
    pdf.set_font('Helvetica', '', 10)
    pdf.cell(0, 10, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='R')
    pdf.ln(5)
    
    # Calculate summary statistics based on category
    total_income = sum(t['amount'] for t in transactions if t['category'].lower() == 'income')
    total_expenses = sum(t['amount'] for t in transactions if t['category'].lower() != 'income')
    net_amount = total_income - total_expenses
    
    # Summary section
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 10, 'Summary', border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')
    pdf.set_font('Helvetica', '', 10)
    pdf.cell(0, 8, f"Total Income: BDT {total_income:,.2f}", border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')
    pdf.cell(0, 8, f"Total Expenses: BDT {total_expenses:,.2f}", border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')
    pdf.cell(0, 8, f"Net Amount: BDT {net_amount:,.2f}", border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')
    pdf.cell(0, 8, f"Total Transactions: {len(transactions)}", border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')
    pdf.ln(10)
    
    # Table header
    pdf.set_font('Helvetica', 'B', 10)
    # Adjust column widths to use full page width (210mm - 20mm margins = 190mm available)
    # Date: 30mm, Description: 85mm, Amount: 35mm, Category: 40mm = 190mm total
    pdf.cell(30, 10, 'Date', border=1, new_x=XPos.RIGHT, new_y=YPos.TOP, align='C')
    pdf.cell(85, 10, 'Description', border=1, new_x=XPos.RIGHT, new_y=YPos.TOP, align='C')
    pdf.cell(35, 10, 'Amount (BDT)', border=1, new_x=XPos.RIGHT, new_y=YPos.TOP, align='C')
    pdf.cell(40, 10, 'Category', border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
    
    # Table rows
    pdf.set_font('Helvetica', '', 9)
    
    for transaction in transactions:
        # Check if we need a new page
        if pdf.get_y() > 250:  # Leave space for footer
            pdf.add_page()
            # Re-add table header on new page
            pdf.set_font('Helvetica', 'B', 10)
            pdf.cell(30, 10, 'Date', border=1, new_x=XPos.RIGHT, new_y=YPos.TOP, align='C')
            pdf.cell(85, 10, 'Description', border=1, new_x=XPos.RIGHT, new_y=YPos.TOP, align='C')
            pdf.cell(35, 10, 'Amount (BDT)', border=1, new_x=XPos.RIGHT, new_y=YPos.TOP, align='C')
            pdf.cell(40, 10, 'Category', border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
            pdf.set_font('Helvetica', '', 9)
        
        # Format data
        date_str = transaction.get('date', 'N/A')
        if isinstance(date_str, datetime):
            date_str = date_str.strftime('%Y-%m-%d')
        
        description = transaction.get('description', 'N/A')
        # Truncate long descriptions to fit the wider column
        if len(description) > 50:
            description = description[:47] + "..."
        
        amount = transaction.get('amount', 0)
        amount_str = f"{amount:,.2f}"
        
        category = transaction.get('category', 'N/A').title()
        
        # Set color for amount based on category (green for income, red for expenses)
        is_income = category.lower() == 'income'
        if is_income:
            pdf.set_text_color(0, 128, 0)  # Green for income
        else:
            pdf.set_text_color(255, 0, 0)  # Red for expenses
        
        # Add row
        pdf.cell(30, 8, date_str, border=1, new_x=XPos.RIGHT, new_y=YPos.TOP, align='C')
        pdf.set_text_color(0, 0, 0)  # Reset to black for other cells
        pdf.cell(85, 8, description, border=1, new_x=XPos.RIGHT, new_y=YPos.TOP, align='L')
        
        # Set color again for amount based on category
        if is_income:
            pdf.set_text_color(0, 128, 0)  # Green for income
        else:
            pdf.set_text_color(255, 0, 0)  # Red for expenses
        pdf.cell(35, 8, amount_str, border=1, new_x=XPos.RIGHT, new_y=YPos.TOP, align='R')
        
        pdf.set_text_color(0, 0, 0)  # Reset to black
        pdf.cell(40, 8, category, border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
    
    # Return PDF as bytes instead of saving to file
    try:
        return bytes(pdf.output())  # Convert bytearray to bytes for Django compatibility
    except Exception as e:
        raise Exception(f"Failed to create PDF: {str(e)}")


def test():
    """Test function to demonstrate PDF generation"""
    sample_transactions = [
        {"date": "2025-01-15", "description": "Grocery Store - Weekly Shopping", "amount": -85.50, "category": "Groceries"},
        {"date": "2025-01-16", "description": "Gas Station - Shell", "amount": -45.20, "category": "Transportation"},
        {"date": "2025-01-17", "description": "Salary Deposit", "amount": 3200.00, "category": "Income"},
        {"date": "2025-01-18", "description": "Netflix Subscription", "amount": -15.99, "category": "Entertainment"},
        {"date": "2025-01-19", "description": "Restaurant - Pizza Palace", "amount": -32.75, "category": "Dining"},
        {"date": "2025-01-20", "description": "ATM Withdrawal", "amount": -100.00, "category": "Cash"},
        {"date": "2025-04-21", "description": "Electric Bill Payment", "amount": -120.45, "category": "Utilities"},
        {"date": "2025-02-22", "description": "Online Shopping - Amazon", "amount": -67.89, "category": "Shopping"},
        {"date": "2025-05-23", "description": "Coffee Shop - Daily Grind", "amount": -8.25, "category": "Dining"},
        {"date": "2025-01-24", "description": "Pharmacy - CVS", "amount": -24.99, "category": "Healthcare"},
        {"date": "2025-01-15", "description": "Grocery Store - Weekly Shopping", "amount": -85.50, "category": "Groceries"},
        {"date": "2025-01-16", "description": "Gas Station - Shell", "amount": -45.20, "category": "Transportation"},
        {"date": "2025-01-17", "description": "Salary Deposit", "amount": 3200.00, "category": "Income"},
        {"date": "2025-01-18", "description": "Netflix Subscription", "amount": -15.99, "category": "Entertainment"},
        {"date": "2025-01-19", "description": "Restaurant - Pizza Palace", "amount": -32.75, "category": "Dining"},
        {"date": "2025-01-20", "description": "ATM Withdrawal", "amount": -100.00, "category": "Cash"},
        {"date": "2025-01-21", "description": "Electric Bill Payment", "amount": -120.45, "category": "Utilities"},
        {"date": "2025-01-22", "description": "Online Shopping - Amazon", "amount": -67.89, "category": "Shopping"},
        {"date": "2025-01-23", "description": "Coffee Shop - Daily Grind", "amount": -8.25, "category": "Dining"},
        {"date": "2025-01-24", "description": "Pharmacy - CVS", "amount": -24.99, "category": "Healthcare"},
        {"date": "2025-01-15", "description": "Grocery Store - Weekly Shopping", "amount": -85.50, "category": "Groceries"},
        {"date": "2025-01-16", "description": "Gas Station - Shell", "amount": -45.20, "category": "Transportation"},
        {"date": "2025-01-17", "description": "Salary Deposit", "amount": 3200.00, "category": "Income"},
        {"date": "2025-01-18", "description": "Netflix Subscription", "amount": -15.99, "category": "Entertainment"},
        {"date": "2025-01-19", "description": "Restaurant - Pizza Palace", "amount": -32.75, "category": "Dining"},
        {"date": "2025-01-20", "description": "ATM Withdrawal", "amount": -100.00, "category": "Cash"},
        {"date": "2025-01-21", "description": "Electric Bill Payment", "amount": -120.45, "category": "Utilities"},
        {"date": "2025-01-22", "description": "Online Shopping - Amazon", "amount": -67.89, "category": "Shopping"},
        {"date": "2025-01-23", "description": "Coffee Shop - Daily Grind", "amount": -8.25, "category": "Dining"},
        {"date": "2025-01-24", "description": "Pharmacy - CVS", "amount": -24.99, "category": "Healthcare"}
    ]
    
    try:
        # Generate PDF
        pdf_bytes = create_transaction_pdf(
            transactions=sample_transactions,
            filename="sample_transaction_report.pdf",
        )
        
        # Save the PDF bytes to file for testing
        with open("sample_transaction_report.pdf", "wb") as f:
            f.write(pdf_bytes)
        
        print(f"✅ PDF generated successfully: {os.path.abspath('sample_transaction_report.pdf')}")
        print(f"📄 PDF size: {len(pdf_bytes)} bytes")
        
        # Print summary
        total_income = sum(t['amount'] for t in sample_transactions if t['amount'] > 0)
        total_expenses = sum(abs(t['amount']) for t in sample_transactions if t['amount'] < 0)
        print(f"📊 Summary:")
        print(f"   Total Income: BDT {total_income:,.2f}")
        print(f"   Total Expenses: BDT {total_expenses:,.2f}")
        print(f"   Net Amount: BDT {total_income - total_expenses:,.2f}")
        print(f"   Total Transactions: {len(sample_transactions)}")
        
    except Exception as e:
        print(f"❌ Error generating PDF: {e}")


if __name__ == "__main__":
    test()