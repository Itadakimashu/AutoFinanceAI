import os
import requests
import json

def extract_text_from_image(image_file, api_key):
    """
    Extract text from an image using API Ninjas image-to-text service
    
    Args:
        image_file: Django UploadedFile object or file path string
        api_key (str): API Ninjas API key
        
    Returns:
        dict: Response from API containing extracted text
    """
    api_url = 'https://api.api-ninjas.com/v1/imagetotext'
    
    try:
        # Handle both file path and Django uploaded file
        if isinstance(image_file, str):
            # File path case (for backward compatibility)
            if not os.path.exists(image_file):
                return {"error": f"Image file not found: {image_file}"}
            
            with open(image_file, 'rb') as f:
                files = {'image': f}
                headers = {'X-Api-Key': api_key}
                response = requests.post(api_url, files=files, headers=headers)
        else:
            # Django uploaded file case
            files = {'image': image_file}
            headers = {'X-Api-Key': api_key}
            response = requests.post(api_url, files=files, headers=headers)
        
        # Check if request was successful
        if response.status_code == 200:
            result = response.json()
            return {
                "success": True,
                "extracted_text": result,
                "status_code": response.status_code
            }
        else:
            return {
                "success": False,
                "error": f"API request failed with status code: {response.status_code}",
                "response": response.text
            }
            
    except requests.exceptions.RequestException as e:
        return {"error": f"Network error: {str(e)}"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}
