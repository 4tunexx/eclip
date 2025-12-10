#!/bin/bash

echo "=== CONNECTIVITY TEST ==="
echo ""

echo "Can we reach google.com (DNS)?"
ping -c 1 google.com 2>&1 | grep -E "(bytes|ENOTFOUND|unreachable)" | head -1

echo ""
echo "Can we reach 8.8.8.8 (Google DNS - no hostname)?"
ping -c 1 8.8.8.8 2>&1 | grep -E "(bytes|ENOTFOUND|unreachable)" | head -1

echo ""
echo "Can we resolve google.com?"
nslookup google.com 2>&1 | grep -E "(Address|NXDOMAIN)" | head -2

echo ""
echo "Current DNS servers (/etc/resolv.conf):"
cat /etc/resolv.conf 2>&1 | head -5

echo ""
echo "Can we resolve the Neon hostname?"
nslookup ep-square-tree-addwk4t7-pooler.c-2.us-east-1.aws.neon.tech 2>&1

echo ""
echo "=== END TEST ==="
