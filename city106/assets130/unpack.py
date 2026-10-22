"""Extract only the user-supplied asset archives, including nested source zips."""
from pathlib import Path
from zipfile import ZipFile
import json

ROOT = Path(__file__).resolve().parents[3] / 'work' / 'assets130'
NAMES = ['traffic-light', 'sinowatcher-malaysia-traffic-signal-set-2',
         'metro-bench-model', 'polara-crosswalk-with-scanned-texture', 'sidewalks',
         'cobblestone-floor-texture', 'flower-stand-filled', 'soviet-bench-2',
         'bench-002', 'grass', 'street-and-city-props-dumpster-traffic-light',
         'waste-bins', 'trash-can-recycle-bin-16mb-4part',
         'school-bus-conversion', 'city-bus-rigged-5236']

def extract(source, target):
    target.mkdir(parents=True, exist_ok=True)
    with ZipFile(source) as archive:
        for entry in archive.infolist():
            destination = (target / entry.filename).resolve()
            if not destination.is_relative_to(target.resolve()):
                raise ValueError('Unsafe archive path: ' + entry.filename)
        archive.extractall(target)

for name in NAMES:
    folder = ROOT / 'source' / name
    extract(Path.home() / 'Desktop' / (name + '.zip'), folder)
    for nested in list(folder.rglob('*.zip')):
        extract(nested, nested.with_suffix(''))
    print(json.dumps({'asset': name, 'sources': [str(p.relative_to(folder)) for p in folder.rglob('*') if p.suffix.lower() in ['.fbx', '.blend', '.glb', '.obj', '.dae']]}))
