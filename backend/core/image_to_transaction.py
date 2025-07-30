from google import genai
import json

from .constants import catagory_choices

def image_to_transaction(image_bytes, api_key):
    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[
        genai.types.Part.from_bytes(
            data=image_bytes,
            mime_type='image/jpeg',
        ),
        'Make a transaction list from this receipt.',
        '''Output Format:[
            {"date": "YYYY-MM-DD", "description": "Burger King - Burger", "amount": 32, "category": "Food"},
            {"date": "YYYY-MM-DD", "description": "Burger King - Frenchfries", "amount": 13, "category": "Food"},
            ...]
        ''',
        'Categories: ['
        + ', '.join([f'"{category}"' for category in catagory_choices])
        + ']'
        ]
    )

    # Parse the response - remove markdown formatting
    response_text = response.text.strip()
    
    # Remove markdown code block formatting if present
    if response_text.startswith('```json'):
        response_text = response_text[7:]  # Remove '```json'
    if response_text.endswith('```'):
        response_text = response_text[:-3]  # Remove '```'
    
    # Clean any extra whitespace
    response_text = response_text.strip()
    
    transactions = json.loads(response_text)
    return transactions
