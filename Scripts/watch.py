import os
import time
from generate_site import build_site

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
WATCH_DIRS = [os.path.join(ROOT, 'Projects'), os.path.join(ROOT, 'Archive')]


def snapshot():
    state = {}
    for directory in WATCH_DIRS:
        for root, _, files in os.walk(directory):
            for name in files:
                if name.startswith('.'):
                    continue
                path = os.path.join(root, name)
                try:
                    stat = os.stat(path)
                except FileNotFoundError:
                    continue
                state[path] = stat.st_mtime
    return state


def main():
    build_site()
    last_state = snapshot()
    print('[watch] watching Projects and Archive for changes...')
    try:
        while True:
            time.sleep(1.5)
            current_state = snapshot()
            if current_state != last_state:
                build_site()
                print(f"[watch] site regenerated at {time.strftime('%Y-%m-%d %H:%M:%S')}")
                last_state = current_state
    except KeyboardInterrupt:
        print('\n[watch] stopped')


if __name__ == '__main__':
    main()
