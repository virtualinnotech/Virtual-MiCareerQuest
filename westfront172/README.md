# DeVos west front (172)

The park strip between the westbridge sidewalk and the DeVos west wall is now
the street wall from the real Lyon Street view:

- the dark glass entrance (black frame, white roof railing) where Lyon Street
  meets the building, with a granite planter of bushes and flowers and five
  flags: POW/MIA, Michigan, the United States, Kent County and Grand Rapids;
- the dark-paneled DeVos block to the left, with a covered drive-under;
- the brick hotel tower and the older stone-and-brick hotel to the right,
  running to the Front Ave corner; a beige hotel tower rises behind the glass.

`core.js` (loaded before the city) holds the layout. The city loader asks it
which park pieces to leave out (trees, lawn, benches, bins, park lamps and
their lights), moves Calder's La Grande Vitesse and its uplights to the plaza
across Front Ave behind the glass building, and keeps the westbridge traffic
signals that the farm field rule used to drop (the DeVos-side poles step 0.25
toward the curb). Pedestrians on the old park walk use the sidewalk in front;
the grove walk, which ran inside the hospitality addition, is gone.

`runtime.js` builds the geometry and canvas textures once, adds them to the
venue's render batches (so they are culled, lit and shadowed like the rest)
and registers box colliders. The farm scene hides these batches and drops the
colliders while it runs.
