#!/usr/bin/env python3
"""
Test LLM API connection to diagnose issues
Default: Google Gemini 2.5 Pro
Fallback: OpenAI GPT models
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv('mcp/.env')

def test_llm_connection():
    """Test LLM API connection (default: Google Gemini)"""
    print("🧪 Testing LLM API Connection...")
    print("=" * 50)
    
    # Check Google API key first (default)
    google_api_key = os.getenv('GOOGLE_API_KEY')
    openai_api_key = os.getenv('OPENAI_API_KEY')
    
    if google_api_key:
        print(f"✅ Google API key found: {google_api_key[:10]}...")
        return test_google_connection(google_api_key)
    elif openai_api_key:
        print(f"✅ OpenAI API key found: {openai_api_key[:10]}...")
        return test_openai_connection(openai_api_key)
    else:
        print("❌ No API key found!")
        print("Please add your Google API key (default) or OpenAI API key to mcp/.env file")
        return False

def test_google_connection(api_key):
    """Test Google Gemini API connection"""
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        
        print("🔗 Testing Google Gemini API connection...")
        
        # Create Gemini client
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-pro",
            google_api_key=api_key
        )
        
        # Simple test request
        response = llm.invoke("Hello")
        
        print("✅ Google Gemini API connection successful!")
        print(f"✅ Response: {response.content}")
        return True
        
    except Exception as e:
        print(f"❌ Google Gemini API connection failed: {e}")
        
        # Provide specific error guidance
        error_str = str(e)
        if "certificate verify failed" in error_str:
            print("\n💡 This is an SSL certificate issue.")
            print("   Try running: fix-ssl-issues.bat")
        elif "API key" in error_str or "authentication" in error_str:
            print("\n💡 This is an API key issue.")
            print("   Check your Google API key in mcp/.env")
        elif "quota" in error_str or "billing" in error_str:
            print("\n💡 This is a billing/quota issue.")
            print("   Check your Google Cloud account balance and usage")
        
        return False

def test_openai_connection(api_key):
    """Test OpenAI API connection"""
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        
        print("🔗 Testing OpenAI API connection...")
        
        # Simple test request
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=5
        )
        
        print("✅ OpenAI API connection successful!")
        print(f"✅ Response: {response.choices[0].message.content}")
        return True
        
    except Exception as e:
        print(f"❌ OpenAI API connection failed: {e}")
        
        # Provide specific error guidance
        error_str = str(e)
        if "certificate verify failed" in error_str:
            print("\n💡 This is an SSL certificate issue.")
            print("   Try running: fix-ssl-issues.bat")
        elif "API key" in error_str or "authentication" in error_str:
            print("\n💡 This is an API key issue.")
            print("   Check your OpenAI API key in mcp/.env")
        elif "quota" in error_str or "billing" in error_str:
            print("\n💡 This is a billing/quota issue.")
            print("   Check your OpenAI account balance and usage")
        
        return False

    # Test SSL certificates
    try:
        import certifi
        cert_path = certifi.where()
        print(f"✅ SSL certificates: {cert_path}")
    except ImportError:
        print("⚠️  certifi not installed")

if __name__ == "__main__":
    success = test_llm_connection()
    
    if success:
        print("\n🎉 All tests passed! Your LLM connection is working.")
    else:
        print("\n❌ Connection test failed. Please fix the issues above.")
    
    input("\nPress Enter to exit...") 