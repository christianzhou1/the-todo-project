#!/bin/bash

# Setup Traffic Monitoring on VPS
# This script sets up comprehensive traffic monitoring for your Todo app

set -e

echo "=== Setting up Traffic Monitoring on VPS ==="
echo "Current directory: $(pwd)"
echo ""

# Function to install monitoring tools
install_monitoring_tools() {
    echo "=== Installing Monitoring Tools ==="
    
    # Update package list
    apt-get update -y
    
    # Install essential monitoring tools
    apt-get install -y \
        htop \
        iotop \
        nethogs \
        iftop \
        tcpdump \
        netstat-nat \
        ss \
        curl \
        wget
    
    echo "Monitoring tools installed successfully"
    echo ""
}

# Function to setup enhanced nginx logging
setup_nginx_logging() {
    echo "=== Setting up Enhanced Nginx Logging ==="
    
    # Backup current nginx config
    if [ -f nginx.conf ]; then
        cp nginx.conf nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
        echo "Backed up current nginx.conf"
    fi
    
    # Replace with enhanced logging config
    if [ -f nginx-traffic-monitoring.conf ]; then
        cp nginx-traffic-monitoring.conf nginx.conf
        echo "Applied enhanced nginx logging configuration"
    else
        echo "Warning: nginx-traffic-monitoring.conf not found"
    fi
    
    # Create log directory if it doesn't exist
    mkdir -p /var/log/nginx
    
    # Set proper permissions
    chown -R www-data:www-data /var/log/nginx
    chmod -R 755 /var/log/nginx
    
    echo "Nginx logging setup complete"
    echo ""
}

# Function to setup log rotation
setup_log_rotation() {
    echo "=== Setting up Log Rotation ==="
    
    cat > /etc/logrotate.d/nginx-traffic << EOF
/var/log/nginx/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 \$(cat /var/run/nginx.pid)
        fi
    endscript
}
EOF
    
    echo "Log rotation configured"
    echo ""
}

# Function to make monitoring scripts executable
setup_monitoring_scripts() {
    echo "=== Setting up Monitoring Scripts ==="
    
    # Make scripts executable
    chmod +x monitor-traffic.sh
    chmod +x network-monitor.sh
    
    # Create symlinks for easy access
    ln -sf $(pwd)/monitor-traffic.sh /usr/local/bin/monitor-traffic
    ln -sf $(pwd)/network-monitor.sh /usr/local/bin/network-monitor
    
    echo "Monitoring scripts are now available as:"
    echo "  monitor-traffic"
    echo "  network-monitor"
    echo ""
}

# Function to restart services
restart_services() {
    echo "=== Restarting Services ==="
    
    # Restart nginx to apply new configuration
    if docker-compose ps nginx | grep -q "Up"; then
        echo "Restarting nginx container..."
        docker-compose restart nginx
    else
        echo "Nginx container not running"
    fi
    
    echo "Services restarted"
    echo ""
}

# Function to show usage instructions
show_usage_instructions() {
    echo "=== Traffic Monitoring Setup Complete! ==="
    echo ""
    echo "You can now monitor traffic using these commands:"
    echo ""
    echo "1. Real-time nginx logs:"
    echo "   monitor-traffic live"
    echo ""
    echo "2. Traffic summary:"
    echo "   monitor-traffic all"
    echo ""
    echo "3. Network connections:"
    echo "   network-monitor connections"
    echo ""
    echo "4. Real-time network monitoring:"
    echo "   network-monitor live"
    echo ""
    echo "5. View nginx logs directly:"
    echo "   tail -f /var/log/nginx/access.log"
    echo ""
    echo "6. Monitor Docker containers:"
    echo "   docker-compose logs -f"
    echo ""
    echo "=== Quick Start ==="
    echo "To start monitoring right now:"
    echo "  monitor-traffic live"
    echo ""
}

# Main execution
main() {
    echo "Starting traffic monitoring setup..."
    echo ""
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        echo "Please run as root or with sudo"
        exit 1
    fi
    
    # Install tools
    install_monitoring_tools
    
    # Setup nginx logging
    setup_nginx_logging
    
    # Setup log rotation
    setup_log_rotation
    
    # Setup monitoring scripts
    setup_monitoring_scripts
    
    # Restart services
    restart_services
    
    # Show usage instructions
    show_usage_instructions
}

# Run main function
main "$@"
