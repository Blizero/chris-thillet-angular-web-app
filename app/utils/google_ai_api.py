import pathlib
import os
import textwrap
import google.generativeai as genai
from IPython.display import display, Markdown
import time


def configure_api(api_key=None):
    if not api_key:
        api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        raise ValueError("API key not found. Please set the GOOGLE_API_KEY environment variable.")
    genai.configure(api_key=api_key)


def to_markdown(text):
    # text = text.replace('•', '  *')
    # markedDownText = to_markdown(text)
    # return Markdown(textwrap.indent(text, '> ', predicate=lambda _: True))
    return Markdown(textwrap.indent(text, '> ', predicate=lambda _: True))


def generate_text(prompt):
    model = genai.GenerativeModel('gemini-1.5-flash')
    # Example function to generate text using the Google Generative AI API
    print('Gemini Prompt: ', prompt)
    response = model.generate_content(prompt)  # Replace `some_function` with the actual function
    return response


def gen_cq_gemini(prompt, max_retries=4, delay=2):
    retry_count = 0
    model = genai.GenerativeModel('gemini-pro')
    question = prompt
    while retry_count < max_retries:
        try:
            response = model.generate_content(question)
            return response.text
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(delay)
            retry_count += 1
    return None


