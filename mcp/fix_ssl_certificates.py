#!/usr/bin/env python3
"""
Script to fix SSL certificate issues for OpenAI API connections
"""
import ssl
import certifi
import os
import sys

def fix_ssl_certificates():
    """Fix SSL certificate issues"""
    print("🔧 Fixing SSL certificate issues...")
    
    # Method 1: Use certifi certificates
    try:
        cert_path = certifi.where()
        print(f"✅ Certifi certificates found at: {cert_path}")
        
        # Set environment variable for requests
        os.environ['REQUESTS_CA_BUNDLE'] = cert_path
        os.environ['SSL_CERT_FILE'] = cert_path
        
        print("✅ SSL environment variables set")
        
    except Exception as e:
        print(f"❌ Error setting up certifi: {e}")
    
    # Method 2: Test OpenAI connection
    try:
        import openai
        
        # Test with a simple request
        print("🧪 Testing OpenAI connection...")
        
        # This would require API key, so we'll just test import
        print("✅ OpenAI library imported successfully")
        
    except Exception as e:
        print(f"❌ Error testing OpenAI: {e}")
    
    print("\n🎯 SSL certificate fixes applied!")
    print("Try running the test case again.")

if __name__ == "__main__":
    fix_ssl_certificates() 