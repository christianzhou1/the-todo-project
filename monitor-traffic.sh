#!/bin/bash

# Traffic Monitoring Script for Todo App VPS
# This script provides various ways to monitor traffic hitting your server

echo "=== Todo App Traffic Monitor ==="
echo "Server IP: $(curl -s ifconfig.me)"
echo "Current Time: $(date)"
echo ""

# Function to show real-time nginx access logs
monitor_nginx_logs() {
    echo "=== Real-time Nginx Access Logs ==="
    echo "Press Ctrl+C to stop monitoring"
    echo ""
    tail -f /var/log/nginx/access.log 2>/dev/null || echo "Nginx logs not found. Make sure nginx is running."
}

# Function to show recent traffic summary
show_traffic_summary() {
    echo "=== Recent Traffic Summary (Last 100 requests) ==="
    if [ -f /var/log/nginx/access.log ]; then
        tail -100 /var/log/nginx/access.log | awk '
        {
            print $1 " - " $4 " - " $7 " - " $9 " - " $12
        }' | column -t -s " - "
    else
        echo "Nginx access log not found"
    fi
    echo ""
}

# Function to show top IPs
show_top_ips() {
    echo "=== Top IP Addresses (Last 1000 requests) ==="
    if [ -f /var/log/nginx/access.log ]; then
        tail -1000 /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -nr | head -10
    else
        echo "Nginx access log not found"
    fi
    echo ""
}

# Function to show HTTP status codes
show_status_codes() {
    echo "=== HTTP Status Codes (Last 1000 requests) ==="
    if [ -f /var/log/nginx/access.log ]; then
        tail -1000 /var/log/nginx/access.log | awk '{print $9}' | sort | uniq -c | sort -nr
    else
        echo "Nginx access log not found"
    fi
    echo ""
}

# Function to show most requested URLs
show_top_urls() {
    echo "=== Most Requested URLs (Last 1000 requests) ==="
    if [ -f /var/log/nginx/access.log ]; then
        tail -1000 /var/log/nginx/access.log | awk '{print $7}' | sort | uniq -c | sort -nr | head -10
    else
        echo "Nginx access log not found"
    fi
    echo ""
}

# Function to monitor network connections
monitor_connections() {
    echo "=== Current Network Connections ==="
    echo "Active connections to port 80 (HTTP):"
    netstat -an | grep :80 | grep ESTABLISHED | wc -l
    echo "Active connections to port 443 (HTTPS):"
    netstat -an | grep :443 | grep ESTABLISHED | wc -l
    echo "Active connections to port 8080 (Backend):"
    netstat -an | grep :8080 | grep ESTABLISHED | wc -l
    echo ""
}

# Function to show Docker container status
show_docker_status() {
    echo "=== Docker Container Status ==="
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
}

# Function to show system resources
show_system_resources() {
    echo "=== System Resources ==="
    echo "Memory Usage:"
    free -h
    echo ""
    echo "Disk Usage:"
    df -h
    echo ""
    echo "Load Average:"
    uptime
    echo ""
}

# Main menu
case "$1" in
    "live")
        monitor_nginx_logs
        ;;
    "summary")
        show_traffic_summary
        ;;
    "ips")
        show_top_ips
        ;;
    "status")
        show_status_codes
        ;;
    "urls")
        show_top_urls
        ;;
    "connections")
        monitor_connections
        ;;
    "docker")
        show_docker_status
        ;;
    "resources")
        show_system_resources
        ;;
    "all")
        show_traffic_summary
        show_top_ips
        show_status_codes
        show_top_urls
        monitor_connections
        show_docker_status
        show_system_resources
        ;;
    *)
        echo "Usage: $0 {live|summary|ips|status|urls|connections|docker|resources|all}"
        echo ""
        echo "Commands:"
        echo "  live        - Monitor nginx logs in real-time"
        echo "  summary     - Show recent traffic summary"
        echo "  ips         - Show top IP addresses"
        echo "  status      - Show HTTP status codes"
        echo "  urls        - Show most requested URLs"
        echo "  connections - Show current network connections"
        echo "  docker      - Show Docker container status"
        echo "  resources   - Show system resources"
        echo "  all         - Show all information"
        echo ""
        echo "Examples:"
        echo "  $0 live      # Real-time monitoring"
        echo "  $0 all       # Complete overview"
        echo "  $0 ips       # Top IP addresses"
        ;;
esac
