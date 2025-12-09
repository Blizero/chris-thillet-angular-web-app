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


def to_markdown(text: str):
    return Markdown(textwrap.indent(text, '> ', predicate=lambda _: True))


def generate_text(prompt: str):
    model = genai.GenerativeModel('gemini-2.5-flash')
    print('Gemini Prompt: ', prompt)
    response = model.generate_content(prompt)

    if response.text is None:
        # You can inspect safety here if you want:
        # print(response.candidates[0].finish_reason, response.candidates[0].safety_ratings)
        raise RuntimeError("Model returned no text (possibly blocked by safety filters).")
    return response.text


def gen_cq_gemini(prompt: str, max_retries=4, delay=2):
    retry_count = 0
    model = genai.GenerativeModel('gemini-2.5-flash')  # or 1.5 model names, depending on what you actually use
    question = prompt

    while retry_count < max_retries:
        try:
            response = model.generate_content(question)

            if response.text is None:
                # Treat this as an error so we don't pass None downstream
                raise RuntimeError(
                    f"Model returned no text. finish_reason={response.candidates[0].finish_reason}"
                )

            return response.text

        except Exception as e:
            print(f"Error on attempt {retry_count + 1}: {e}")
            retry_count += 1
            time.sleep(delay)

    # All retries failed
    return None


def error_handler(prompt: str):
    response_text = gen_cq_gemini(prompt)

    if response_text is None:
        # This is where you return HTTP 500 in Flask / FastAPI
        return "Sorry, the AI model failed to generate a response.", 500

    # Now it's safe to process the text, including splitlines()
    lines = response_text.splitlines()
    # ... do whatever you need with 'lines' ...
    return response_text