export const sources={
 cpu:['Intel Core i7-11700K','https://www.intel.com/content/www/us/en/products/sku/212047/intel-core-i711700k-processor-16m-cache-up-to-5-00-ghz/specifications.html'],
 board:['ASUS ROG Maximus XIII Hero manual','https://dlcdnets.asus.com/pub/ASUS/mb/LGA1200/ROG_MAXIMUS_XIII_HERO/E18089_ROG_MAXIMUS_XIII_HERO_UM_V3_WEB.pdf'],
 ram:['Kingston KVR32N22D8/16 datasheet','https://www.kingston.com/dataSheets/KVR32N22D8_16.pdf'],
 gpu:['NVIDIA RTX 2060 installation guide','https://www.nvidia.com/content/geforce-gtx/GEFORCE_RTX_2060_USER_GUIDE_v02.pdf'],
 cooler:['Noctua NH-U12S manual','https://cdn.noctua.at/media/noctua_nh_u12s_manual_en_web.pdf'],
 psu:['Corsair CX750M, CP-9020061','https://www.corsair.com/ww/en/p/psu/cp-9020061-na/cx-series-cx750m-750-watt-80-plus-bronze-certified-modular-atx-psu-cp-9020061-na'],
 drive:['Seagate BarraCuda specifications','https://www.seagate.com/www-content/datasheets/pdfs/3-5-barracudaDS1900-14-2007US-en_US.pdf'],
 case:['Corsair 4000D Airflow clearances','https://www.corsair.com/ww/en/p/pc-cases/cc-9011201-ww/4000d-airflow-tempered-glass-mid-tower-atx-case-white-cc-9011201-ww'],
 installation:['Intel LGA1200 installation','https://www.intel.com/content/www/us/en/support/articles/000005762/processors.html']
};
export const parts=[
 {id:'case',name:'Case',icon:'monitor',spec:'ATX mid-tower | 4000D Airflow reference',role:'The case supports and protects the hardware. Its mounting points, cooling clearance and airflow path matter as much as its appearance.',detail:'Reference limits: ATX motherboard, 360 mm GPU length and 170 mm CPU cooler height. The supplied case is a visual model, not a dimensionally exact Corsair replica.',question:'What must match before installing a motherboard?',options:['The case color','The board form factor and standoff pattern','The monitor refresh rate'],answer:1,source:'case'},
 {id:'board',name:'Motherboard',icon:'circuit-board',spec:'ROG Maximus XIII Hero | Z590 | LGA1200 | ATX',role:'The motherboard links the processor, memory, storage and graphics card. Its socket and memory generation determine which parts can be installed.',detail:'This Intel LGA1200 reference board uses DDR4. The separately supplied B550 board represents an AMD AM4 platform; it cannot accept our Intel CPU.',question:'Which CPU platform fits this reference board?',options:['AMD AM4','Intel LGA1700','Intel LGA1200'],answer:2,source:'board'},
 {id:'cpu',name:'Processor',icon:'cpu',spec:'Core i7-11700K | 8 cores / 16 threads | LGA1200',role:'The CPU executes instructions, including game logic and operating-system tasks. The K suffix permits overclocking, but this lesson uses standard settings.',detail:'DDR4-3200 support; 125 W TDP is a thermal design rating, not a maximum system power draw. Hold the CPU by its edges and never touch the socket contacts.',question:'What determines the CPU orientation?',options:['The pin-1 triangle and alignment notches','Whichever way the logo faces','The direction of the case fans'],answer:0,source:'cpu'},
 {id:'ramA',name:'Memory',icon:'memory-stick',spec:'2 x 16 GB Kingston KVR32N22D8/16 | DDR4-3200',role:'RAM is fast, temporary working memory. It holds active programs and data; its contents are lost when power is removed.',detail:'32 GB total, 288-pin UDIMMs, 1.2 V, CL22. Use A2 and B2 for this two-module reference configuration. DDR5 does not fit DDR4 slots.',question:'Which sockets should hold these two modules?',options:['A1 and A2','Any two sockets','A2 and B2'],answer:2,source:'ram'},
 {id:'cooler',name:'CPU cooling',icon:'fan',spec:'NH-U12S reference | 158 mm tall | 4-pin PWM fan',role:'The heatsink moves heat away from the CPU; the fan moves air through its fins. Thermal compound fills microscopic gaps between the two surfaces.',detail:'158 mm is below the reference case limit of 170 mm. Use the correct LGA1200 mounting kit. Never run the processor without a properly mounted cooler.',question:'Why is thermal compound used?',options:['To glue the cooler in place','To improve thermal contact','To insulate the CPU from heat'],answer:1,source:'cooler'},
 {id:'gpu',name:'Graphics card',icon:'monitor',spec:'GeForce RTX 2060 Founders Edition | 6 GB GDDR6',role:'The GPU renders the images shown on the display. Its VRAM stores graphics data; it does not replace system RAM.',detail:'Reference board power: 160 W. NVIDIA specifies a 500 W minimum system PSU and one 8-pin PCIe power connection. Other RTX 2060 variants can differ.',question:'Where should the gaming monitor connect?',options:['A video output on the graphics card','A SATA port','The CPU power connector'],answer:0,source:'gpu'},
 {id:'drive',name:'Storage',icon:'hard-drive',spec:'Seagate ST2000DM008 | 2 TB | SATA 6 Gb/s | 7200 RPM',role:'Storage keeps files and programs when the PC is off. This mechanical hard drive is useful for capacity; a compatible SSD would generally load games faster.',detail:'A SATA drive needs both a data cable to the motherboard and a power cable from the PSU. 6 Gb/s is the interface rate, not the drive sustained transfer rate.',question:'Which connections does this drive need?',options:['Only SATA data','Only SATA power','SATA data and SATA power'],answer:2,source:'drive'},
 {id:'psu',name:'Power supply',icon:'plug',spec:'Corsair CX750M CP-9020061 | 750 W | 80 PLUS Bronze',role:'The PSU converts wall power into the DC rails used by the components. Its wattage is available capacity, not a constant power draw.',detail:'Keep it unplugged while assembling. Never open a PSU enclosure. Use only cables approved for that exact PSU; modular pinouts are not universally interchangeable.',question:'Can an 8-pin EPS CPU cable replace an 8-pin PCIe GPU cable?',options:['Yes, because both have eight pins','No, their wiring and keying differ','Only if the cable is the same color'],answer:1,source:'psu'}
];
// Keep the specifications in the build sheet; lessons introduce one idea at a time.
const lessons={
 case:{role:'The case holds and protects all the computer parts.',question:'What does the case do?',options:['Makes the game graphics','Holds and protects the parts','Stores your games']},
 board:{role:'The motherboard connects the parts so they can work together.',question:'Which part connects the other computer parts?',options:['The case','The cooling fan','The motherboard']},
 cpu:{role:'The CPU is the computer\'s processor. It follows instructions to run programs and games.',question:'What does the CPU do?',options:['Runs instructions','Stores files when power is off','Cools the case']},
 ramA:{role:'RAM holds the information a program is using right now. It clears when the PC turns off.',question:'What is RAM used for?',options:['Keeping files when the PC is off','Cooling the CPU','Holding information in use right now']},
 cooler:{role:'The CPU cooler carries heat away from the processor.',question:'Why does the CPU need a cooler?',options:['To store more games','To keep it from overheating','To power the motherboard']},
 gpu:{role:'The graphics card creates the images you see in a game.',question:'Which part creates the game graphics?',options:['The graphics card','The hard drive','The power supply']},
 drive:{role:'The hard drive keeps games and files, even when the PC is off.',question:'Where are games and files saved?',options:['In the cooling fan','In the case','On the hard drive']},
 psu:{role:'The power supply gives electricity to the computer parts.',question:'What does the power supply do?',options:['Creates game graphics','Supplies power to the parts','Stores your files']}
};
for(const part of parts)Object.assign(part,lessons[part.id]);
for(const part of parts){delete part.question;delete part.options;delete part.answer;}
const step=(id,title,text,part,target,extra={})=>({id,title,text,part,target,...extra});
export const buildSteps=[
 step('safety','Make the bench safe','Switch the PSU off, unplug wall power, use an ESD-safe work area and handle boards by their edges. Keep drinks and loose metal away.','safety','bench',{kind:'choice',options:['Leave the PSU plugged in and on','Switch off, unplug and use ESD precautions','Open the PSU to inspect it'],answer:1}),
 step('panel','Open the case','Remove the side-panel fasteners and place the panel somewhere safe. Lay a real case on its side when appropriate; the teaching view keeps it upright for visibility.','panel','panel',{kind:'remove'}),
 step('standoffs','Match the ATX standoffs','Fit only the standoffs that align with motherboard mounting holes. An extra standoff touching the underside can short the board.','standoffs','tray',{kind:'fasten',count:9}),
 step('board','Fit the motherboard','Align the rear I/O and lower the board onto the standoffs. This reference board has an integrated I/O shield. Do not trap cables underneath.','board','tray',{kind:'place'}),
 step('board-screws','Secure the motherboard','Secure the nine mounting points gently. Tighten until snug, without overtightening or bending the board.','screwdriver','boardScrew',{kind:'fasten',count:9}),
 step('socket','Open the CPU socket','Release the lever and raise the load plate. Do not touch the delicate LGA socket contacts. Keep the protective cap for future transport.','lever','socket',{kind:'action'}),
 step('cpu','Align and seat the CPU','Match the gold pin-1 triangle and keyed notches. The CPU should sit flat without force. Rotate the part until the markers align.','cpu','socket',{kind:'place',orientation:1}),
 step('latch','Close the retention mechanism','Lower the load plate, then secure the lever under its hook. Follow the board manual for the protective cap; never leave it between CPU and cooler.','lever','socket',{kind:'action'}),
 step('ramA','Install memory in A2','Open the retaining latch. Align the offset notch and press evenly on the module ends until it is seated and the latch closes.','ramA','A2',{kind:'place',orientation:2}),
 step('ramB','Install memory in B2','Add the matching second 16 GB DDR4 module in B2, leaving A1 and B1 empty. The pair provides 32 GB total.','ramB','B2',{kind:'place',orientation:2}),
 step('bracket','Fit the cooler mounting kit','Use the LGA1200 backplate, black spacers and mounting bars specified by the cooler manual. The motherboard tray opening provides rear access.','bracket','coolerMount',{kind:'fasten',count:4}),
 step('paste','Apply thermal compound','Remove any protective film from the cooler base. On this clean LGA1200 CPU, apply the small center dot specified by the Noctua manual. Do not add more paste over pre-applied compound.','paste','socket',{kind:'action'}),
 step('cooler','Place the heatsink','Set the cooler squarely on the CPU and mounting bars, with airflow directed toward the rear exhaust. The reference cooler clears the case and RAM.','cooler','socket',{kind:'place'}),
 step('cooler-screws','Tighten the cooler evenly','Alternate between the two spring-loaded screws, following the cooler instructions. Even pressure matters; do not force the screws beyond their stop.','screwdriver','coolerScrew',{kind:'fasten',count:2}),
 step('cpu-fan','Connect CPU cooling','Connect the cooler fan to CPU_FAN. The keyed 4-pin header provides power, speed sensing and PWM control.','cpuFan','CPU_FAN',{kind:'cable'}),
 step('psu','Fit the power supply','Fit the PSU in the lower bay with its fan facing the filtered intake. Check that the intake is unobstructed and the wall cable is still disconnected.','psu','psuBay',{kind:'place'}),
 step('psu-screws','Secure the power supply','Secure the four rear mounting screws. Never insert a screw or tool through the PSU ventilation grille.','screwdriver','psuScrew',{kind:'fasten',count:4}),
 step('drive','Install the hard drive','Secure the sealed 3.5-inch SATA drive in its tray, then slide the tray into the lower drive cage. Keep the connectors accessible. Never remove the drive cover.','drive','driveBay',{kind:'place'}),
 step('gpu','Seat the graphics card','Remove the matching expansion-slot covers, release the top x16 slot latch, and seat the card evenly until the latch engages.','gpu','PCIE_X16_1',{kind:'place'}),
 step('gpu-screws','Secure the graphics bracket','Fasten the graphics card bracket to the case. Support a heavy card so its weight does not bend the slot.','screwdriver','gpuScrew',{kind:'fasten',count:2}),
 step('atx','Connect motherboard power','Route the PSU 24-pin ATX lead to the matching motherboard socket. Align the latch; never force a keyed connector.','atx','ATX_24',{kind:'cable'}),
 step('eps','Connect CPU power','Use the EPS/CPU 4+4-pin lead at the primary 8-pin CPU power input. Do not substitute PCIe 6+2. Consult the board manual for any additional CPU power input.','eps','EPS_8',{kind:'cable'}),
 step('pcie','Connect graphics power','Use the PCIe 6+2-pin lead as one 8-pin connector on this RTX 2060 reference card. EPS/CPU is not interchangeable.','pcie','GPU_8',{kind:'cable'}),
 step('sata-data','Connect storage data','Connect a SATA data lead from the drive to a motherboard SATA port. The L-shaped key must align at both ends.','sataData','SATA_DATA',{kind:'cable'}),
 step('sata-power','Connect storage power','Connect a PSU SATA power plug to the drive. The wider SATA power connector is separate from its data connection.','sataPower','SATA_POWER',{kind:'cable'}),
 step('case-fans','Connect case cooling','Connect the case fan harness to the chassis fan headers, within each header current limit. Keep front intake and rear exhaust paths clear.','caseFans','CHA_FAN',{kind:'cable'}),
 step('front-panel','Connect the case power switch','Find the PWR_SW pins using the motherboard manual. The switch has no polarity; LED leads do. A USB or audio header is not a substitute.','frontPanel','PWR_SW',{kind:'cable'}),
 step('front-usb','Connect front USB','Align the keyed front USB connector with the correct header. Check the case and motherboard manuals; different USB header types are not interchangeable.','usb','USB_HEADER',{kind:'cable'}),
 step('front-audio','Connect front audio','Route the HD AUDIO lead to AAFP, keeping it away from fan blades. Match the missing pin to the blocked hole.','audio','AAFP',{kind:'cable'}),
 step('inspect','Inspect before power-on','Check for loose screws, fully seated RAM and cables, a secured cooler, and wires clear of fans. Plug the monitor into the graphics card, then connect keyboard and wall power.','inspect','bench',{kind:'choice',options:['Power on without checking the cooler','Inspect, connect the GPU display and peripherals','Leave the loose screws inside'],answer:1})
];
export const bootSteps=[
 {title:'Power-on self-test',text:'The simulated firmware checks the installed components before loading an operating system.',action:'Power on',id:'post'},
 {title:'Verify the detected hardware',text:'Confirm the CPU, total memory and SATA drive match the build sheet. These are simulated readings, not measurements from your Chromebook.',action:'Confirm hardware',id:'verify'},
 {title:'Prepare the training system',text:'A new PC needs an operating system and drivers. This lesson uses a simulated preconfigured training image; no real disk is erased and no OS is downloaded.',action:'Load training image',id:'os'},
 {title:'Close the case',text:'After a successful test, shut down and unplug before replacing the side panel. Reconnect power when the panel is secured.',action:'Shut down and fit panel',id:'close'}
];

export const installationList=[
 {id:'case',name:'Case & supports',image:'case',first:0,last:2},
 {id:'board',name:'Motherboard',image:'board',first:3,last:4},
 {id:'cpu',name:'CPU',image:'cpu',first:5,last:7},
 {id:'ramA',name:'RAM sticks',image:'ramA',first:8,last:9},
 {id:'cooler',name:'CPU cooler & paste',image:'cooler',first:10,last:14},
 {id:'psu',name:'Power supply',image:'psu',first:15,last:16},
 {id:'drive',name:'Hard drive',image:'drive',first:17,last:17},
 {id:'gpu',name:'Graphics card',image:'gpu',first:18,last:19},
 {id:'power',name:'Power cables',image:'power',first:20,last:22},
 {id:'storage',name:'Drive cables',image:'storage',first:23,last:24},
 {id:'fans',name:'Case fans',image:'fans',first:25,last:25},
 {id:'front',name:'Case port cables',image:'front',first:26,last:29}
];

const directions={
 safety:['Power off first','Turn off and unplug the power supply. Use an anti-static mat or strap.',{options:['Keep the power on','Turn off, unplug, and prevent static','Open the power supply']}],
 panel:['Remove the side panel','Remove the side panel so you can reach inside the case.'],
 standoffs:['Add the board supports','Fit a support at each marked hole. These keep the motherboard off the metal case.'],
 board:['Place the motherboard','Place the motherboard on the supports. Line up its ports with the back of the case.'],
 'board-screws':['Screw down the motherboard','Add a screw at each marked hole. Tighten gently so the board stays flat.'],
 socket:['Open the CPU holder','Lift the small lever, then open the cover. Do not touch the contacts inside.'],
 cpu:['Place the CPU','Match the CPU triangle to the socket triangle. Set it flat without pushing.'],
 latch:['Lock the CPU in place','Lower the cover. Push the lever down and tuck it under the hook.'],
 ramA:['Add the first RAM stick','Open the slot latch. Match the notch and press the stick evenly into A2 until it clicks.'],
 ramB:['Add the second RAM stick','Match the notch and press the second stick into B2 until it clicks.'],
 bracket:['Add the cooler supports','Fit the LGA1200 cooler supports. Secure all four marked points.'],
 paste:['Add thermal paste','Remove the cooler\'s protective film. Add a small dot of paste to the CPU center. Skip the dot if the cooler already has paste.'],
 cooler:['Place the CPU cooler','Place the cooler on the CPU. Face its fan toward the rear of the case.'],
 'cooler-screws':['Secure the cooler','Tighten the two screws a little at a time, alternating sides. Do not force them.'],
 'cpu-fan':['Plug in the CPU fan','Connect the cooler fan cable to CPU_FAN on the motherboard.'],
 psu:['Place the power supply','Place it in the bottom bay. Face its fan toward the filtered vent. Keep wall power unplugged.'],
 'psu-screws':['Secure the power supply','Add the four screws at the back of the case. Keep tools out of the vents.'],
 drive:['Add the hard drive','Secure the drive in its tray. Slide the tray into the lower bay with the plugs facing out.'],
 gpu:['Add the graphics card','Remove the matching slot covers. Press the card into the top long slot until the latch clicks.'],
 'gpu-screws':['Secure the graphics card','Screw the card\'s metal bracket to the case so the card stays supported.'],
 atx:['Power the motherboard','Connect the wide 24-pin ATX cable to ATX_24. Line up the latch.'],
 eps:['Power the CPU','Connect the 4+4-pin CPU cable to EPS_8. Do not use the graphics card cable here.'],
 pcie:['Power the graphics card','Connect the 6+2-pin graphics cable to GPU_8. Do not use the CPU cable here.'],
 'sata-data':['Connect the drive to the board','Connect the small SATA data cable between the drive and motherboard. Match the L-shaped plugs.'],
 'sata-power':['Power the hard drive','Connect the wider SATA power cable from the power supply to the drive.'],
 'case-fans':['Plug in the case fans','Connect the case fan cable to CHA_FAN. Keep wires out of the blades.'],
 'front-panel':['Connect the power button','Connect the case power-button cable to PWR_SW. Use the board manual to find the pins.'],
 'front-usb':['Connect the front USB ports','Connect the front USB cable to USB_HEADER. Match the plug shape; do not force it.'],
 'front-audio':['Connect the headphone port','Connect the HD AUDIO cable to AAFP. Match the blocked hole to the missing pin.'],
 inspect:['Check before turning on','Check the cooler, RAM, plugs, and loose screws. Connect the monitor to the graphics card.',{options:['Turn on without checking','Check the build, then connect the monitor','Leave loose screws inside']}]
};
for(const item of buildSteps){
 const [title,text,extra]=directions[item.id];
 // Retain the longer safety and compatibility notes for the optional build sheet.
 item.note=item.text;
 Object.assign(item,{title,text},extra);
 if(item.kind==='choice'){item.kind='instruction';item.action=item.id==='safety'?'Bench ready':'Checks complete';delete item.options;delete item.answer;}
}
const bootCopy=[
 ['Connect your gaming setup','Fit the side panel while power is off. Connect the curved monitor to the graphics card and the white keyboard and mouse to USB.','Connect DisplayPort + USB'],
 ['Power on','Press the highlighted power button on the case.','Power on'],
 ['Starting your PC','The monitor shows the simulated component checks.','Checking'],
 ['All systems ready','The practice system and its drivers are ready for the graphics test.','Test graphics']
];
bootSteps.forEach((item,i)=>{const [title,text,action]=bootCopy[i];Object.assign(item,{title,text,action});});

sources.case=['Phanteks Evolv X2 reference','https://phanteks.com/product/evolv-x2-white/'];
Object.assign(parts.find(p=>p.id==='case'),{spec:'ATX mid-tower | Evolv X2 reference | glass front and side',detail:'Reference layout: three 120 mm bottom intake fans, three 120 mm top exhaust fans, one 120 mm rear fan, and a top 360 mm radiator. The white case and lighting are illustrative, not manufacturer CAD.'});
sources.ram=['Corsair VENGEANCE RGB PRO white reference','https://www.corsair.com/us/en/p/memory/cmw32gx4m2e3200c16w/vengeancea-rgb-pro-32gb-2-x-16gb-ddr4-dram-3200mhz-c16-memory-kit-a-white-cmw32gx4m2e3200c16w'];
Object.assign(parts.find(p=>p.id==='ramA'),{spec:'32 GB (2 x 16 GB) | DDR4-3200 C16 | white VENGEANCE RGB PRO reference',detail:'Use A2 and B2 for this two-module DDR4 configuration. 3200 MT/s is the kit rating; actual speed depends on system support and firmware settings. This lesson does not change overclocking settings.'});
sources.cooler=['NZXT Kraken Elite 360 RGB reference','https://nzxt.com/products/kraken-360-elite-rgb-1'];
Object.assign(parts.find(p=>p.id==='cooler'),{name:'Liquid CPU cooling',spec:'360 mm AIO reference | LGA1200 | 3 x 120 mm radiator fans',role:'A liquid cooler carries CPU heat to a radiator. Fans move that heat out of the case.',detail:'A sealed 360 mm liquid-cooling reference compatible with LGA1200. The display shows a simulated temperature. White hoses stay sealed; follow the supplied cooler wiring and mounting instructions.'});
const updateStep=(id,changes)=>Object.assign(buildSteps.find(item=>item.id===id),changes,changes.text?{note:changes.text}:{});
updateStep('bracket',{text:'Fit the liquid cooler supports for LGA1200. Secure the four marked points.'});
updateStep('cooler',{title:'Place the liquid cooler',text:'Set the pump block on the CPU. Keep the sealed hoses attached to the radiator; do not open or fill them.'});
updateStep('cooler-screws',{title:'Secure the pump block',text:'Tighten the four retaining points evenly. Keep pressure gentle and follow the cooler mounting instructions.',count:4});
updateStep('paste',{note:'Use the paste already on the pump base, or follow the cooler instructions to apply fresh compound. Do not add fresh paste over pre-applied compound.'});
updateStep('cpu-fan',{title:'Connect the pump speed cable',text:'Connect the pump speed-signal cable to CPU_FAN so the motherboard can check cooling.'});
const fanSteps=[
 step('frontFans','Install the bottom fans','Mount the three bottom fans with their airflow pointing up into the case. Leave the filtered intake below them clear.','frontFans','BOTTOM_FANS',{kind:'place'}),
 step('rearFan','Install the rear fan','Mount the rear fan with its airflow pointing out of the case. This removes warm air.','rearFan','REAR_FAN',{kind:'place'}),
 step('topFans','Mount the radiator and its fans','Secure the 360 mm radiator at the top. Its three fans push warm air up and out. Keep the hoses clear of the blades.','topFans','TOP_FANS',{kind:'place'}),
 step('pump-power','Power the cooling controller','Connect a SATA power lead from the power supply to the cooling controller. It powers the pump and radiator fans.','pumpPower','PUMP_POWER',{kind:'cable'}),
 step('pump-usb','Connect the cooling controller','Connect the controller USB cable to the internal USB 2.0 header. This lets the software control the lighting and cooling.','pumpUsb','USB_2',{kind:'cable'})
];
for(const item of fanSteps)item.note=item.text;
buildSteps.splice(20,0,...fanSteps);
updateStep('case-fans',{text:'Connect the bottom and rear fan harness to CHA_FAN. Connect their RGB leads to the compatible lighting controller. Keep wires away from blades.'});
const membership={case:['safety','panel','standoffs'],board:['board','board-screws'],cpu:['socket','cpu','latch'],ramA:['ramA','ramB'],cooler:['bracket','paste','cooler','cooler-screws','cpu-fan','pump-power','pump-usb'],psu:['psu','psu-screws'],drive:['drive'],gpu:['gpu','gpu-screws'],power:['atx','eps','pcie'],storage:['sata-data','sata-power'],fans:['frontFans','rearFan','topFans','case-fans'],front:['front-panel','front-usb','front-audio','inspect']};
for(const item of installationList){item.steps=membership[item.id];item.first=Math.min(...item.steps.map(id=>buildSteps.findIndex(s=>s.id===id)));item.last=Math.max(...item.steps.map(id=>buildSteps.findIndex(s=>s.id===id)));}
installationList.find(item=>item.id==='cooler').name='Liquid cooler & paste';
installationList.splice(8,0,installationList.splice(10,1)[0]);

// Visual references are not a claim that the pictured DDR4 kit fits an AM5 system.
sources.cpu=['AMD Ryzen 7 9800X3D','https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-7-9800X3d.html'];
sources.board=['AMD AM5 platform reference',sources.cpu[1]];
sources.installation=['AMD Ryzen AM5 platform',sources.cpu[1]];
sources.gpu=['ASUS ROG Astral GeForce RTX White Edition','https://rog.asus.com/us/graphics-cards/graphics-cards/rog-astral/rog-astral-rtx5090-32g-white/'];
sources.psu=['ASUS ROG Thor 1200W Platinum III White Edition','https://rog.asus.com/power-supply-units/rog-thor/rog-thor-1200p3-white-gaming/'];
for(const [id,changes]of Object.entries({
 board:{spec:'ATX | AM5 training layout | ROG-style hardware',detail:'The simulated socket represents AM5 for the Ryzen processor. The rear PCB uses raised solder joints and a socket backplate. This is an illustrative teaching board, not exact manufacturer CAD.'},
 cpu:{spec:'AMD Ryzen 7 9800X3D | AM5',detail:'Notched AM5 heat spreader and etched Ryzen identification. Handle the CPU by its edges and do not touch socket contacts. A real build requires an AM5 motherboard with compatible firmware and DDR5 memory.'},
 ramA:{spec:'32 GB simulated memory | white Corsair VENGEANCE RGB PRO styling',detail:'The supplied RGB PRO photo depicts DDR4 memory. Its white heat spreaders and lighting are visual references only: the AM5 simulation represents DDR5. DDR4 cannot be installed in a real AM5/DDR5 motherboard. Check the board memory support list.'},
 gpu:{spec:'ASUS ROG Astral GeForce RTX | White Edition | four-fan model',detail:'Three front fans and one rear fan cool the fin stack. The top-edge high-power socket is a simplified training connector. Use the card and PSU manuals for the correct cable, seating and bend clearance.'},
 psu:{spec:'ASUS ROG Thor | 1200 W | White Edition',detail:'White enclosure, ventilated grille and an illustrative 1200W capacity display. Keep unplugged during assembly. Never open a PSU or mix modular cables from other models.'},
 cooler:{spec:'360 mm AIO reference | AM5 mounting | 3 radiator fans',detail:'Use the AM5 kit and the mounting procedure supplied with the actual cooler. Hoses stay sealed. The temperature display is simulated.'}
}))Object.assign(parts.find(p=>p.id===id),changes);
updateStep('ramB',{text:'Add the matching second module in B2. For a real AM5 system, use compatible DDR5 memory, not the DDR4 kit shown as a styling reference.'});
updateStep('bracket',{text:'Fit the liquid cooler supports for AM5. Secure the four marked points using the cooler instructions.'});
updateStep('pcie',{text:'Connect the matching high-power GPU lead approved for this PSU and card. Fully seat it and leave space for a gentle bend. Never substitute an EPS CPU cable.'});
