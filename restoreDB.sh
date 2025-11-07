cd /home/dthompson/snap/mysql-workbench-community/13/dumps/Dump20251103/

for file in $(ls *.sql | sort); do
    echo "Processing $file"
    if mysql -u root -pPassword2023! MyNFL < "$file"; then
        echo "✓ Successfully restored $file"
    else
        echo "✗ Failed to restore $file"
        exit 1
    fi
done

echo "All files restored successfully!"
