# IT Network Troubleshooting Challenge

The walk-in room is an annex beyond the IT sector's south wall. Windowed double doors open away from either approaching side and spring closed after passage. A red entrance beacon and SERVER ROOM sign identify the doorway. Nine cabinets, scaled to 65% of their previous size, stand directly adjacent in three rows with walkable aisles. The supplied rack and computer models retain shared GPU buffers; 450 animated LEDs use three instanced draws. Original Desktop files are unchanged.

Walking into the room starts the outage notice. Each numbered cabinet has a hinged, clickable door and 50 individually phased activity lights. Servers 02 and 05 have amber diagnostic indicators beside loose Ethernet connectors. Either cable can be repaired first; the computer test reports whichever links remain disconnected. Repairing both and testing restores service, awards 200 challenge points, and switches off the rotating red warning lights. Progress remains when walking out and back in; Restart at the computer resets it.

The diagnostics tower uses the same 0.65 scale as the other racks. Its laptop is scaled a further 0.75 around the shelf hinge, including the live screen overlay, giving a 0.173-unit width against the 0.72-unit character height. The console collider follows the resized cabinet. `scale96-test.cjs` checks these proportions and the drone sign on desktop/mobile.

Repairs require proximity and an open door. The thin loose connectors are only slightly unseated behind dark glass. Hovering or focusing the connector reveals its click target. Clicking animates insertion, with avatar arm IK in third-person and a gloved hand in first-person. The view button is optional; normal walking and camera controls remain available. The diagnostic computer can only run tests when approached. Test/repair operations reject duplicate actions.

This is an educational simulation: amber is the challenge's fault indicator, not a universal Ethernet LED convention. Diagnostics do not access any real network. There is no required repair order; students may also repair both connections before testing.

Tests:

```sh
node network40/core-test.cjs
NODE_PATH='../work/browser/node_modules' node network40/browser-test.cjs
NODE_PATH='../work/browser/node_modules' node network40/annex-test.cjs
```

Browser tests require the preview server on port 8014. They cover both repairs, first- and third-person animation, diagnostics, mobile canvas pixels and controls, aisle walking, entry-only start, walking through the doors in both directions, spring closure, all nine cabinet interaction positions, and restart. After changes, run `bash splice-venue.sh` and `npm run sync:forklift --prefix booth-shipping`.
