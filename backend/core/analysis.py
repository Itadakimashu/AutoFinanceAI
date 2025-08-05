from google import genai


def transaction_analysis(api_key, current_transactions, previous_transactions=None):
    """
    Analyzes transactions and provides realistic financial insights with month-over-month comparisons.
    
    Args:
        current_transactions (list): Current month's transaction dictionaries
        previous_transactions (list, optional): Previous month's transactions for comparison
        user_income (float, optional): User's monthly income for percentage calculations
        api_key (str): API key for Gemini AI
        
    Returns:
        dict: Comprehensive financial analysis with actionable insights
    """
    
    # Prepare comparison context
    comparison_context = ""
    if previous_transactions:
        comparison_context = f"PREVIOUS MONTH TRANSACTIONS FOR COMPARISON: {previous_transactions}"
    
    
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=f'''
            You are a simple financial advisor. Analyze these transactions and give easy-to-understand advice.
            
            Rules:
            - Keep all text short and simple
            - Use bullet points with specific dollar amounts
            - Give actionable tips like "Save $200 this month"
            - Avoid long explanations
            - Use everyday language
            - Currency is Bangladeshi Taka (BDT)

            CURRENT MONTH TRANSACTIONS: {current_transactions}
            {comparison_context}

            Provide a simple, user-friendly analysis in this exact JSON format. Keep all text short and easy to understand:
            {{
                "overview": "Brief 1-2 sentence summary of spending period and key insight",
                
                "financial_score": {{
                    "score": 75,
                    "status": "Good/Fair/Poor"
                }},
                
                "quick_tips": [
                    "Save BDT500 this month",
                    "Reduce food spending by BDT200",
                    "Set aside BDT100 for emergencies"
                ],
                
                "warnings": [
                    "High spending on entertainment",
                    "No emergency savings"
                ],
                
                "good_habits": [
                    "Staying within grocery budget",
                    "Consistent saving pattern"
                ]
            }}
            now if the current transactions analysis is not for the actual current month, make sure to give the analysis in past tense.

            '''
        )
        
        # Parse the response and return as JSON
        import json
        try:
            # Handle different response formats from Gemini API
            if hasattr(response, 'text'):
                if isinstance(response.text, list):
                    # If response.text is a list, join it or take the first element
                    response_text = ' '.join(response.text) if response.text else ""
                else:
                    response_text = str(response.text)
            else:
                response_text = str(response)
            
            response_text = response_text.strip()
            
            # Try to extract JSON from the response
            if response_text.startswith('```json'):
                response_text = response_text[7:-3]  # Remove ```json and ```
            elif response_text.startswith('```'):
                response_text = response_text[3:-3]  # Remove ``` and ```
            
            return json.loads(response_text)
        except json.JSONDecodeError:
            # If parsing fails, return the raw text
            return {"analysis": response_text, "error": "Could not parse as JSON"}
            
    except Exception as e:
        return {"error": f"Analysis failed: {str(e)}"}


def test():
    """
    Test function for the transaction analysis with sample data.
    """
    sample_transactions = [
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

    # Note: API key should be passed as parameter, not hardcoded
    api_key = "your-api-key-here"  # This should come from environment variables
    
    try:
        result = transaction_analysis(api_key, sample_transactions)
        print("Analysis Result:")
        print(result)
    except Exception as e:
        print(f"Test failed: {e}")


if __name__ == "__main__":
    test()
