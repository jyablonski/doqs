import re
import sys
from datetime import datetime, timezone


def update_last_updated(file_path):
    with open(file_path, "r+") as file:
        content = file.read()
        # Regex to find the `lastUpdated` field and replace it
        new_content = re.sub(
            r"lastUpdated: .*",
            f"lastUpdated: {datetime.now(timezone.utc).date()}",
            content,
        )
        file.seek(0)
        file.write(new_content)
        file.truncate()


if __name__ == "__main__":
    # `sys.argv` will contain the paths to the files passed by pre-commit
    for file_path in sys.argv[1:]:
        if file_path.endswith(".md"):
            update_last_updated(file_path)
