from google import genai
from .constants import catagory_choices


def predict_category(transactions, api_key):
    """
    Predicts the category for each transaction using an external AI service.
    Args:
        transactions (list): A list of transaction dictionaries.
        api_key (str): API key for the external AI service.
    Returns:
        list: A list of transactions with predicted categories.
    """
    client = genai.Client(api_key=api_key)
    for transaction in transactions:
        transaction_description = transaction['description']
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=f"Predict the category for this transaction: {transaction_description}. Categories: {', '.join([choice[1] for choice in catagory_choices])} output format: clothing(without the first letter capitalized)"
        )
        predicted_category = response.text.strip()
        transaction['category'] = predicted_category if predicted_category else 'miscellaneous'
    return transactions
    
