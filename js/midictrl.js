class MIDICtrl {
    static input = undefined;
    static in_thru = undefined;
    static kbd = undefined;
    static thru = undefined;
    static output = undefined;
    static midijs = JZZ.Widget({ _receive: function(msg) { this.emit(msg); }});
    static sheet_pos = 0;
    static note_pos = 0;

    constructor(){}

    static async init() {
        const default_in_midi = JZZ.Widget({ _receive: function(msg) { this.emit(msg); }});
        const default_out_midi = JZZ.Widget({ _receive: function(msg) { this.emit(msg); }});
        const inst_name = "Acoustic Grand Piano";
        // const midijs = JZZ.synth.MIDIjs({ soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/", instrument: "steinway_lite.sf2" })
        //     .or(function(){ console.log('Cannot load MIDI.js!\n' + this.err()); MIDICtrl.onMidiOutFail; })
        //     .and(function(){ console.log("MIDIjs Loaded"); });
        // JZZ.addMidiOut(inst_name, midijs);

        JZZ.synth.MIDIjs.register(inst_name, { soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/", instrument: "acoustic_grand_piano" })

        const synth_name = "Synth";
        JZZ.synth.Tiny.register(synth_name);

        JZZ.addMidiIn('None', default_in_midi);
        JZZ.addMidiOut('None', default_out_midi);

        function getKeySizes() {
            //let sizes = [152, 38, 100, 24];
            let sizes = [152, 38, 100, 22];
            let ratio = window.innerWidth / ((sizes[1]) * 52);
            for (let i in sizes) sizes[i] = sizes[i]*ratio+2;

            return sizes;
        }

        let in_thru = JZZ.Widget({ _receive: function(msg) {
            if(!this.blocked) this.emit(msg);
            else this.emit(JZZ.MIDI.active());
        }})
        in_thru.blocked = false;

        let key_sizes = getKeySizes();
        let kbd = await JZZ.input.Kbd({at:'piano', from:'A1', to:'C9',//from:'A0', to:'C8',
            wl:key_sizes[0], ww:key_sizes[1], bl:key_sizes[2], bw:key_sizes[3],
            0:   { pos: 'W' },
            320: { },
            onCreate: function() {
                // resize 이벤트 등록
                this.onResize = function() {
                    let key_sizes = getKeySizes();

                    this.current.wl = key_sizes[0];
                    this.current.ww = key_sizes[1];
                    this.current.bl = key_sizes[2];
                    this.current.bw = key_sizes[3];
                    this.createAt(this.current.at);
                    
                    let cnt = 0;
                    let i = 0;
                    let keys = this.getKeys().keys;
                    let key_objs = this.keys;
                    let black_keys = this.getBlackKeys().keys;
                    for (let idx in keys) {
                        i = keys[idx];
                        let isBlackKey = (black_keys.indexOf(i) >= 0);

                        let left = parseInt(this.locs[i].left.split("px")[0].trim());
                        //console.log(left);
                        left = (left > 3 ? left-(3*cnt) : 0);
                        if (isBlackKey) left++;
                        left += "px";
                        this.locs[i].left = left;
                        key_objs[i].style["left"] = left;

                        if (!isBlackKey) cnt++;
                    }
                    let piano_width = parseInt(this.locs[i].left.split("px")[0].trim())+key_sizes[1];
                    document.getElementById("piano").firstChild.style.width = piano_width+"px";

                    console.log("change");
                }
            },
            })
            .or(function(){ alert('Cannot open KeyBoard!\n' + this.err()); })
            .and(function(){ this.getKeys().piano.resize() })
        //console.log(kbd.getKeys());

        let thru = await JZZ.Widget({ _receive: function(msg) {
            this.emit(msg);
            // console.log(msg.toString());
            // if (msg.toString().indexOf("Active Sensing") == -1 || true) {
            //     let text = document.getElementById("debug").innerHTML;
            //     if(text.split("<br>").length-1 > 10) {
            //         text = text.split("<br>").slice(1).join("<br>");
            //         document.getElementById("debug").innerHTML = text;
            //     }
            //     document.getElementById("debug").innerHTML += msg.toString()+"<br>";
            // }
            MIDICtrl.render(MIDICtrl.playing_notes());
            if (is_correct() && GlobalVar.next_chord_term == false) {
                clearInterval(GlobalVar.timerid);
                GlobalVar.next_chord_term = true;
                document.getElementById("txts").classList.add("text-white");
                document.getElementById("txts").classList.add("bg-success");
                setTimeout(
                    function(){
                        //print_chord(PlayingChordList.next());
                        auto_print_chord();
                        GlobalVar.next_chord_term = false;
                    }
                    , 1000
                );
            }
        }});

        this.input = default_in_midi;
        this.in_thru=in_thru;
        this.kbd=kbd;
        this.thru=thru;
        this.output = default_out_midi;

        default_in_midi.connect(in_thru);
        in_thru.connect(kbd);
        kbd.connect(thru);
        thru.connect(default_out_midi)

        await JZZ().and(function(){
            let i;
            let selectMidiIn = document.getElementById('selectmidiin');
            let selectMidiOut = document.getElementById('selectmidiout');
            
            for (i = 0; i < this.info().outputs.length; i++) {
                let reverse_idx = this.info().outputs.length-i-1;
                selectMidiOut[i] = new Option(this.info().outputs[reverse_idx].name);
            }
            // selectMidiOut[2].selected = 1; //midijs - 삭제
            // selectMidiOut[1].selected = 1; //synth
            if (i > 2) selectMidiOut[2].selected = 1; // 연결장비
            else selectMidiOut[1].selected = 1; //synth
            // if (!i) {
            //     selectMidiOut[i] = new Option('Not available');
            // }
            for (i = 0; i < this.info().inputs.length; i++) {
                let reverse_idx = this.info().inputs.length-i-1;
                selectMidiIn[i] = new Option(this.info().inputs[reverse_idx].name);
            }
            selectMidiIn[i-1].selected = 1; // 연결장비
            
            //selectMidiIn[i] = new Option('HTML Piano');
            //selectMidiIn[i].selected = 1;

            selectMidiIn.addEventListener('change', MIDICtrl.changeMidiIn);
            selectMidiOut.addEventListener('change', MIDICtrl.changeMidiOut);
        }).and(function() {
            MIDICtrl.changeMidiOut();
            MIDICtrl.changeMidiIn();
        });

        //악보그리기
        //JZZ.addMidiOut('MIDIjs', MIDICtrl.midijs);
        MIDICtrl.render(MIDICtrl.playing_notes());
        console.log(MIDICtrl.playing_notes());
        MIDICtrl.sheet_pos = document.getElementById("paper").firstChild.childNodes[3].getBoundingClientRect().top;
        console.log("note 위치 변경!");
        document.getElementById("paper").firstChild.childNodes.forEach((element)=>{
            if (element.getAttribute("data-name") == "rest") {
                //MIDICtrl.note_pos = element.
            }
        });
    }

    static playing_notes() {
        let notes = MIDICtrl.kbd.getKeys()["piano"].playing;
        let playing_notes = [];
        for (let i in notes)
            if (typeof notes[i] != "undefined")
                playing_notes.push(i);
        return playing_notes;
    }
    
    static changeMidiIn(idx) {
        let selectMidiIn = document.getElementById('selectmidiin');
        if (typeof idx != "number") idx = selectMidiIn.selectedIndex;
        let name = selectMidiIn.options[idx].value;
        if (name == MIDICtrl.input.name()) return;
        if (MIDICtrl.input) MIDICtrl.input.disconnect(MIDICtrl.in_thru);
        // if (name == 'Virtual_in') {
        //     if (midiInPort) midiInPort.close();
        //     midiInPort = piano;
        //     midiInPort.connect(through);
        //     midiInName = name;
        // }
        JZZ().openMidiIn(name).or(MIDICtrl.onMidiInFail).and(MIDICtrl.onMidiInSuccess);
    }

    static changeDrum(idx) {
        let selectMidiIn = document.getElementById('selectmidiin');
        if (typeof idx != "number") idx = selectMidiIn.selectedIndex;
        let name = selectMidiIn.options[idx].value;
        if (name == MIDICtrl.input.name()) return;
        if (MIDICtrl.input) MIDICtrl.input.disconnect(MIDICtrl.in_thru);
        // if (name == 'Virtual_in') {
        //     if (midiInPort) midiInPort.close();
        //     midiInPort = piano;
        //     midiInPort.connect(through);
        //     midiInName = name;
        // }
        JZZ().openMidiIn(name).or(MIDICtrl.onMidiInFail).and(MIDICtrl.onMidiInSuccess);
    }

    static changeMidiOut(idx) {
        let selectMidiOut = document.getElementById('selectmidiout');
        if (typeof idx != "number") idx = selectMidiOut.selectedIndex;
        let name = selectMidiOut.options[idx].value;
        if (name == MIDICtrl.output.name()) return;
        if (MIDICtrl.output) MIDICtrl.thru.disconnect(MIDICtrl.output);
        
        JZZ().openMidiOut(name).and(MIDICtrl.onMidiOutSuccess).or(MIDICtrl.onMidiOutFail);
    }
    
    static setListbox(lb, s) {
        for (let i = 0; i < lb.options.length; i++) if (lb.options[i].value == s) lb.options[i].selected = 1;
    }

    static onMidiOutSuccess() {
        if (MIDICtrl.output) {
            MIDICtrl.output.close();
        }
        MIDICtrl.output = this;
        MIDICtrl.thru.connect(this);
        let midiOutName = this.name();
        let selectMidiOut = document.getElementById('selectmidiout');
        MIDICtrl.setListbox(selectMidiOut, midiOutName);
    }
    
    static onMidiOutFail() {
        if (MIDICtrl.output) MIDICtrl.thru.connect(MIDICtrl.output);
        let midiOutName = this.name();
        let selectMidiOut = document.getElementById('selectmidiout');
        MIDICtrl.setListbox(selectMidiOut, midiOutName);
    }
    
    static onMidiInSuccess() {
        if (MIDICtrl.input) {
            MIDICtrl.input.close();
        }
        MIDICtrl.input = this;
        this.connect(MIDICtrl.in_thru);
        let midiInName = this.name();
        let selectMidiIn = document.getElementById('selectmidiin');
        MIDICtrl.setListbox(selectMidiIn, midiInName);
    }
    
    static onMidiInFail() {
        if (MIDICtrl.input) MIDICtrl.input.connect(MIDICtrl.in_thru);
        let selectMidiIn = document.getElementById('selectmidiin');
        let midiInName = this.name();
        MIDICtrl.setListbox(selectMidiIn, midiInName);
    }

    static render(arr) {
        let abcstring = "X:1\nM:C\nK:C\n%%staves {(PianoRightHand) (PianoLeftHand)}\nV:PianoRightHand clef=treble\nV:PianoLeftHand clef=bass\n";
        let notes = arr;
        let rh = "";
        let lh = "";
        notes.forEach((element) => {
            let key = MIDI.noteToKey[element];
            if (key.includes("b") && document.getElementById("chordtone").innerText.includes("#")) {
                key = MIDI.noteToKey[element-1];
                key = key[0] + "#" + key[1];
            }
            let oct = parseInt(key[key.length-1]);
            let k = key.substr(0,key.length-1);
            if (k[k.length-1] == "#") k = "^" + k[0];
            else if (k[k.length-1] == "b") k = "_" + k[0];

            if (element < MIDI.keyToNote["F3"]) {
                lh += k + ",".repeat(4-oct) + " ";
            }
            else {
                if (oct==3) var oct_add_char = ",";
                else var oct_add_char = "'".repeat(oct-4);

                rh += k + oct_add_char + " ";
            }
        });
        let rhs = "[V: PianoRightHand] ";
        let lhs = "[V: PianoLeftHand] ";
        if (rh == "") rhs += "z8|\n"
        else rhs += "[" + rh + "]8|\n";
        if (lh == "") lhs += "z8|\n"
        else lhs += "[" + lh + "]8|\n";

        document.getElementById("paper").style.marginBottom = 0;
        document.getElementById("paper").style.marginTop = 0;

        ABCJS.renderAbc("paper", abcstring+rhs+lhs, {staffwidth: 150, scale:1.4, responsive: "resize"});
        
        //위치 보정
        let st = document.getElementById("paper").firstChild.childNodes[3].getBoundingClientRect().top;
        if (MIDICtrl.sheet_pos > 0 && st != MIDICtrl.sheet_pos) {
            let diff = st-MIDICtrl.sheet_pos;
            
            if (diff > 0) document.getElementById("paper").style.marginBottom = diff*2+"px";    //중앙정렬때문에 *2
            else document.getElementById("paper").style.marginTop = Math.abs(diff)*2+"px";

            //console.log(diff, MIDICtrl.sheet_pos, document.getElementById("paper").firstChild.childNodes[3].getBoundingClientRect().top, document.getElementById("paper").firstChild.childNodes[3].offsetTop);
        }

    }
}
