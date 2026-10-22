# Student Missions 99

Seven missions replace the former exploration tasks. Each industry requires
its available challenges, five distinct employer questionnaires, and a written
reflection. My Next Step requires a display name, industry interest, after-school
plan, next action, future-company name, and a selected logo.

| Mission | Industry | Challenges |
| --- | --- | --- |
| Feed the Future | Agribusiness | Harvest & Bale; Drone Inspection & Irrigation |
| Make It Happen | Manufacturing | Robotics; Welding |
| Build Our World | Construction | Forklift; Crane |
| Care for People | Health Science | Ambulance; MRI |
| Connect the Future | Information Technology | Network Recovery; PC Build |
| Create Great Experiences | Hospitality | Hibachi Grill (first challenge) |
| My Next Step | Career plan | Written plan and company logo |

## Employer Questions

`core.js` contains three open-ended questions per industry plus a reflection.
They ask what the named employer does, a role and required training, and an
industry-specific process, service, technology, or safety practice. They do not
invent facts about real companies. Students consult the booth/representative.
Answers require 8-700 characters; there is no automated factual grading.

The directory uses real `shippedBooths` IDs and industry names. A new visit can
only be submitted within 1.4 world units of that booth's representative (or its
safe approach point when no representative is loaded). Previously completed
answers remain reviewable/editable even if a booth is removed. Repeat visits
and navigation alone never add credit. Five real booths per industry must be
shipped by the organizer; the UI reports insufficient availability explicitly.

## Persistence and Completion

`mcqStudentMissions_v2` in localStorage stores this browser's progress and answers.
Nothing is uploaded. Old exploration badges do not imply challenge completion.
An existing completed PC workshop certificate is recognized. Success adapters
cover all eleven games, rejecting failed/in-progress states; the PC frame message
handler retains its origin/source validation. Replaying a challenge never erases
earned credit. Browser-storage errors retain the current session and show a warning.

The certificate is unlocked only after all seven missions. It prints the official
MiCareerQuest logo, name/date, seven completed gems, chosen company logo/name,
career plan, all industry reflections, and every saved employer answer. Text is
rendered as text nodes, never injected as HTML. Long answers flow across pages.
Responses belong to a single student per browser profile; clearing site data
removes them. Shared-device sessions should use separate browser profiles.

## Verification

Run `node missions99/core-test.cjs` and, with the local server on port 8014,
`env NODE_PATH=../work/browser/node_modules node missions99/browser-test.cjs`.
Browser tests use temporary employer/status fixtures, not production demo booths;
they verify questionnaires, completion adapters, duplicate/proximity gating,
escaping, keyboard focus, persistence, desktop layouts, and print output.
The individual challenge suites remain responsible for full gameplay coverage.

The bundled Lucide 0.468.0 icon library includes its ISC license. The controls
button uses SlidersVertical, not the watermarked reference image.
