import datetime

SECURITY_TXT_PATH = "facia/public/security.txt"

def update_expires_field(filepath):
    now = datetime.datetime.now(datetime.timezone.utc)
    next_year = now.year + 1
    expires_dt = datetime.datetime(next_year, 6, 1, 8, 0, 0, tzinfo=datetime.timezone.utc)
    expires_str = expires_dt.strftime("Expires: %Y-%m-%dT%H:%M:%SZ")

    with open(filepath, "r") as f:
        lines = f.readlines()

    found = False
    for i, line in enumerate(lines):
        if line.startswith("Expires:"):
            lines[i] = expires_str + "\n"
            found = True
            break

    if not found:
        # Add Expires field if not present
        lines.append(expires_str + "\n")

    with open(filepath, "w") as f:
        f.writelines(lines)

if __name__ == "__main__":
    update_expires_field(SECURITY_TXT_PATH)