# MRI teaching challenge

This is a fictional career-exploration simulation, not diagnostic or clinical competency training. The student acts as an MRI technologist: screening, positioning, acquisition quality, evidence localization, and handoff. A radiologist interprets the study and determines a diagnosis.

## Assets and case

- Machine: user-provided `MRI.zip`, converted from FBX, simplified, with 512px base-color textures. The table and mattress retain separate moving meshes. The runtime asset is approximately 4 MB.
- Doctor: user-provided `doctor.fbx`, converted to `doctor.glb` with its rig and original materials. Entering the suite substitutes this character for the player; leaving restores the original actor. The venue NPC's actual idle, walking and backward clips are retargeted in world space, including arm swing and vertical hip movement.
- Patient: user-provided `hospital+patient+3d+model.glb`, preserving its gown, skin and footwear textures. A 13-bone skeleton and blended gown weights were added to the unrigged model. Seated posture interpolates into a supine position and travels with the table.
- Image: user-provided screenshot dated October 1, 2026 at 1:06:56 PM. The viewer displays ONLY the first row's four sequences. Other rows depict different time points and are deliberately not presented as adjacent slices.
- The source image has no verified patient record, orientation metadata, diagnosis, or reuse license. The fictional Alex Morgan history and conventional R/L teaching orientation are simulation assumptions, not claims about the actual subject. Verify image rights and have a qualified educator validate the case before public deployment or clinical instruction.
- The post-contrast reference is an archived teaching image; no contrast administration is simulated. Motion ghosting on acquisition one is a visual simulation, not the original image's quality.
- No definitive pathology diagnosis is assigned. Accepted evidence is a focal asymmetric region consistently localized on at least two images. The final action is radiologist review.

## Workflow

Enter the single medical door into the control room. The floor finish is flush with the venue floor. The enclosed 3.4 by 4.3 world-unit suite has a ceiling, an observation window, and a second swing door into the scanner room. Both doors open on approach and close after the player passes. Begin at the computer with T and complete four safety checks. Enter the scanner room and assist the seated patient onto the table. Walk to the scanner-side illuminated button and press T. The table travels into the bore. Return through the inner door to assess the images at the computer. Reject the first acquisition for simulated motion, repeat the acquisition from the scanner control, and accept the improved quality. Mark corresponding abnormalities on two sequences and submit side, observation and handoff. The bed returns and the skills HUD is restored after completion.

The simulation compresses acquisition time to ten seconds. Screening checkboxes stand in for a documented process performed by qualified staff; they do not establish real-world MR safety clearance. The magnet remains hazardous even when not acquiring images.

## Primary references

- [RadiologyInfo: MRI safety](https://www.radiologyinfo.org/en/info/safety-mr)
- [RadiologyInfo: Brain MRI](https://www.radiologyinfo.org/en/info/mri-brain)
- [RadiologyInfo: Radiologic technologists](https://www.radiologyinfo.org/en/info/article-radiologic-technologist)
- [RadiologyInfo: Radiologists](https://www.radiologyinfo.org/en/info/article-your-radiologist)

## Verification

`node mri42/core-test.cjs`

`NODE_PATH='../work/browser/node_modules' node mri42/browser-test.cjs` covers both door passages, doctor substitution, restoration, and the full challenge.

Preview: `venue-frame.html?challenge=mri`
