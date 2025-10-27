#!/bin/bash

# Generate SSL certificate for development/testing
echo "Generating self-signed SSL certificate..."

# Create certs directory
mkdir -p certs

# Generate private key
openssl genrsa -out certs/server.key 2048

# Generate certificate signing request
openssl req -new -key certs/server.key -out certs/server.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Generate self-signed certificate
openssl x509 -req -days 365 -in certs/server.csr -signkey certs/server.key -out certs/server.crt

# Clean up CSR file
rm certs/server.csr

echo "SSL certificate generated in certs/ directory:"
echo "  - server.crt (certificate)"
echo "  - server.key (private key)"
echo ""
echo "⚠️  WARNING: This is a self-signed certificate for development only!"
echo "   Browsers will show security warnings. Click 'Advanced' -> 'Proceed' to continue."
