#!/bin/bash

# Simple Network Traffic Monitor
# Uses built-in Linux tools to monitor network traffic

echo "=== Network Traffic Monitor ==="
echo "Server IP: $(curl -s ifconfig.me 2>/dev/null || echo 'Unable to get external IP')"
echo "Current Time: $(date)"
echo ""

# Function to monitor network interfaces
monitor_interfaces() {
    echo "=== Network Interface Statistics ==="
    cat /proc/net/dev | head -2
    cat /proc/net/dev | grep -E "(eth0|ens|enp)" | head -5
    echo ""
}

# Function to show active connections
show_active_connections() {
    echo "=== Active Network Connections ==="
    echo "HTTP (port 80):"
    ss -tuln | grep :80
    echo ""
    echo "HTTPS (port 443):"
    ss -tuln | grep :443
    echo ""
    echo "Backend (port 8080):"
    ss -tuln | grep :8080
    echo ""
    echo "All listening ports:"
    ss -tuln | grep LISTEN
    echo ""
}

# Function to monitor connections in real-time
monitor_connections_realtime() {
    echo "=== Real-time Connection Monitor ==="
    echo "Monitoring new connections... Press Ctrl+C to stop"
    echo ""
    watch -n 1 'ss -tuln | grep -E ":(80|443|8080)" | wc -l'
}

# Function to show recent connections
show_recent_connections() {
    echo "=== Recent Connections (Last 10) ==="
    ss -tuln | head -10
    echo ""
}

# Function to monitor packet traffic
monitor_packets() {
    echo "=== Packet Traffic Statistics ==="
    if command -v iftop >/dev/null 2>&1; then
        echo "Running iftop (requires iftop to be installed)..."
        iftop -i eth0 -t -s 10
    else
        echo "iftop not installed. Installing basic network monitoring..."
        echo "Monitoring network packets for 10 seconds..."
        timeout 10 tcpdump -i any -c 50 2>/dev/null || echo "tcpdump not available"
    fi
    echo ""
}

# Function to show firewall status
show_firewall_status() {
    echo "=== Firewall Status ==="
    if command -v ufw >/dev/null 2>&1; then
        ufw status
    elif command -v iptables >/dev/null 2>&1; then
        iptables -L -n | head -20
    else
        echo "No firewall detected"
    fi
    echo ""
}

# Main menu
case "$1" in
    "interfaces")
        monitor_interfaces
        ;;
    "connections")
        show_active_connections
        ;;
    "live")
        monitor_connections_realtime
        ;;
    "recent")
        show_recent_connections
        ;;
    "packets")
        monitor_packets
        ;;
    "firewall")
        show_firewall_status
        ;;
    "all")
        monitor_interfaces
        show_active_connections
        show_recent_connections
        show_firewall_status
        ;;
    *)
        echo "Usage: $0 {interfaces|connections|live|recent|packets|firewall|all}"
        echo ""
        echo "Commands:"
        echo "  interfaces  - Show network interface statistics"
        echo "  connections - Show active network connections"
        echo "  live        - Monitor connections in real-time"
        echo "  recent      - Show recent connections"
        echo "  packets     - Monitor packet traffic"
        echo "  firewall    - Show firewall status"
        echo "  all         - Show all network information"
        echo ""
        echo "Examples:"
        echo "  $0 live      # Real-time connection monitoring"
        echo "  $0 all       # Complete network overview"
        echo "  $0 packets   # Monitor packet traffic"
        ;;
esac
