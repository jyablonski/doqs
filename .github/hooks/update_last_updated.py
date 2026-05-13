import re
import subprocess
import sys
from datetime import datetime, timezone


def has_staged_content_change(file_path):
    result = subprocess.run(
        ["git", "diff", "--cached", "--unified=0", "--", file_path],
        check=False,
        capture_output=True,
        text=True,
    )

    if result.returncode != 0 or not result.stdout:
        return False

    for line in result.stdout.splitlines():
        if not line.startswith(("+", "-")):
            continue
        if line.startswith(("+++", "---")):
            continue
        if line[1:].lstrip().startswith("lastUpdated:"):
            continue
        return True

    return False


def update_last_updated(file_path):
    with open(file_path, "r+") as file:
        content = file.read()
        new_content = re.sub(
            r"lastUpdated: .*",
            f"lastUpdated: {datetime.now(timezone.utc).date()}",
            content,
        )
        file.seek(0)
        file.write(new_content)
        file.truncate()


if __name__ == "__main__":
    for file_path in sys.argv[1:]:
        if file_path.endswith(".md") or file_path.endswith(".mdx"):
            if has_staged_content_change(file_path):
                update_last_updated(file_path)
