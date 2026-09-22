# MiCareerQuest edited character assets - v11

This pack contains two edited versions of each of the 13 supplied character GLBs:

- `attendees/`: separate clothing materials or an atlas mask for shirts, pants and shoes; default unique colors for each model; optional rigged backpack/cap meshes.
- `volunteers/`: reserved purple shirt (#7038aa) and supplied MiCareerQuest logo on the chest, with the original rig and animation clips.

In the actual v11 game, these templates are instanced with unique outfit colors for each person. The 50 volunteer IDs have purple/logo uniforms; all other NPCs use non-purple shirts. The game applies optional accessory flags individually. Plain GLB viewers show the default accessory choices stored in each template.

The source mesh streams and source animations are retained; these files still require a Draco-compatible GLB loader. New backpack, cap and logo meshes are bound to the source Spine2 or Head joints. Pete retains his original construction helmet; the additional cap is off for that model.

Material extras identify clothing roles and optional accessories. Root extras.crowdAppearanceV11 contains original body bounds, default outfit, attachment-joint metadata and role legend. The original body bounds must be used for body-height normalization rather than the full accessor bounds including hats.

Role IDs: 1 shirt/jacket, 2 pants, 3 shoes, 4 backpack, 5 cap, 6 volunteer logo, 7 small clothing accent, 8 James combined-mesh atlas. James' neutral role atlas encodes clothing categories in alpha; the game uses this only as a role mask, not transparency.

All original files remain available in the full editable project under characters-original/. No fonts are included. No test proxy geometry is present in this pack.

Validation: original geometry/rig/animation data and new accessory weights were checked. The test environment blocks the original compressed-body decoder download, so original decoded body appearance and the fit of attachments across all models still require a visual check in an internet-connected Chrome or a Draco-compatible 3D editor.
