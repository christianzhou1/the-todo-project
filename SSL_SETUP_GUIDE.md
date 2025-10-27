# HTTPS SSL Certificate Setup Guide

This guide will help you set up HTTPS SSL certificates using Let's Encrypt for your todo application.

## Prerequisites

1. **Domain Name**: You need a domain name pointing to your server
2. **Server Access**: SSH access to your server
3. **Docker**: Docker and Docker Compose installed
4. **Ports**: Ports 80 and 443 must be open

## Step-by-Step Setup

### 1. Prepare Your Domain

Make sure your domain DNS is pointing to your server:

```bash
# Check if your domain resolves to your server
dig +short yourdomain.com
curl -s ifconfig.me
```

### 2. Run the SSL Setup Script

```bash
# Make the script executable
chmod +x setup-letsencrypt.sh

# Run the setup (replace with your actual domain and email)
./setup-letsencrypt.sh yourdomain.com your-email@example.com
```

### 3. Update Environment Configuration

After successful certificate generation, update your `.env.production` file:

```bash
# Add these SSL settings to your .env.production
SSL_ENABLED=true
SSL_KEYSTORE=/app/certs/server.p12
SSL_KEYSTORE_PASSWORD=your-keystore-password
SSL_KEYSTORE_TYPE=PKCS12
SSL_KEY_ALIAS=todo-ssl
```

### 4. Set Up Automatic Renewal

Let's Encrypt certificates expire every 90 days. Set up automatic renewal:

```bash
# Make the renewal script executable
chmod +x renew-certificates.sh

# Add to crontab for automatic renewal
sudo crontab -e

# Add this line to run renewal check daily at noon:
0 12 * * * /path/to/your/project/renew-certificates.sh yourdomain.com
```

### 5. Test Your SSL Setup

```bash
# Test SSL configuration
curl -I https://yourdomain.com

# Check SSL grade
# Visit: https://www.ssllabs.com/ssltest/
```

## Manual Certificate Generation

If you prefer to generate certificates manually:

### 1. Stop Nginx Container

```bash
docker stop todo-nginx
```

### 2. Generate Certificate

```bash
sudo certbot certonly --standalone -d yourdomain.com --email your-email@example.com --agree-tos --non-interactive
```

### 3. Copy Certificates

```bash
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./certs/server.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./certs/server.key
sudo chown $USER:$USER ./certs/server.crt ./certs/server.key
chmod 644 ./certs/server.crt
chmod 600 ./certs/server.key
```

### 4. Update Nginx Configuration

```bash
cp nginx-ssl.conf nginx.conf
# Update domain name in nginx.conf
sed -i 's/server_name _;/server_name yourdomain.com;/g' nginx.conf
```

### 5. Restart Services

```bash
docker start todo-nginx
```

## Troubleshooting

### Common Issues

1. **Domain not resolving**: Make sure DNS is pointing to your server
2. **Port 80 blocked**: Ensure port 80 is open for Let's Encrypt validation
3. **Certificate already exists**: Use `--force-renewal` flag if needed
4. **Permission errors**: Make sure you have sudo access

### Debug Commands

```bash
# Check certificate status
sudo certbot certificates

# Test nginx configuration
docker exec todo-nginx nginx -t

# Check nginx logs
docker logs todo-nginx

# Verify SSL
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### Renewal Issues

If automatic renewal fails:

```bash
# Manual renewal
sudo certbot renew --force-renewal

# Check renewal logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

## Security Best Practices

1. **Keep certificates updated**: Set up automatic renewal
2. **Monitor expiration**: Check certificate status regularly
3. **Use strong ciphers**: The nginx-ssl.conf includes secure cipher suites
4. **Enable HSTS**: Consider adding HSTS headers for better security
5. **Regular backups**: Backup your certificates and configuration

## File Structure After Setup

```
your-project/
├── certs/
│   ├── server.crt    # SSL certificate
│   └── server.key    # Private key
├── nginx.conf        # SSL-enabled nginx config
├── nginx-ssl.conf    # SSL template
├── setup-letsencrypt.sh
└── renew-certificates.sh
```

## Next Steps

After SSL setup:

1. **Update your application**: Set `SSL_ENABLED=true` in environment
2. **Test all functionality**: Ensure HTTPS works for all features
3. **Update bookmarks**: Use HTTPS URLs
4. **Monitor logs**: Check for any SSL-related errors
5. **Set up monitoring**: Monitor certificate expiration

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Let's Encrypt documentation: https://letsencrypt.org/docs/
3. Check nginx SSL configuration: https://nginx.org/en/docs/http/configuring_https_servers.html
