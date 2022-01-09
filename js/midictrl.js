var a = "a";
class MIDICtrl {
    static input = undefined;
    static kbd = undefined;
    static thru = undefined;
    static output = undefined;
    static midijs = JZZ.Widget({ _receive: function(msg) { this.emit(msg); }});

    constructor(){}

    static async init() {
        const default_in_midi = JZZ.Widget({ _receive: function(msg) { this.emit(msg); }});
        const default_out_midi = JZZ.Widget({ _receive: function(msg) { this.emit(msg); }});
        const inst_name = "Acoustic Grand Piano";
        const midijs = JZZ.synth.MIDIjs({ soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/", instrument: "acoustic_grand_piano" })
            .or(function(){ console.log('Cannot load MIDI.js!\n' + this.err()); MIDICtrl.onMidiOutFail; })
            .and(function(){ console.log("MIDIjs Loaded"); });
        //JZZ.synth.MIDIjs.register(inst_name, { soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/", instrument: "acoustic_grand_piano" })
        JZZ.addMidiOut(inst_name, midijs);

        const synth_name = "Synth";
        JZZ.synth.Tiny.register(synth_name);

        JZZ.addMidiIn('None', default_in_midi);
        JZZ.addMidiOut('None', default_out_midi);

        //sizes = [150, 42, 100, 24]
        let sizes = [152, 38, 100, 24]
        let ratio = 0.7
        for (let i in sizes) sizes[i] = sizes[i]*ratio;

        let kbd = JZZ.input.Kbd({at:'piano', from:'C3', to:'B4',
            wl:sizes[0], ww:sizes[1], bl:sizes[2], bw:sizes[3],
            0:   { pos: 'W' },
            320: { },
            450: { to: 'E5' },
            610: { to: 'B5' },
            650: { to: 'E6' },
            900: { to: 'B6' },
            //1200: { from: 'C2' , to:'B6'},
            //1200: { to: 'B6' },
            //1500: { from: 'C2' ,to: 'B7' },
            // onCreate: function() {
            //     this.getKeys().setStyle({ margin:0, borderColor:'#00f' });
            //     this.getBlackKeys().setStyle({ backgroundColor:'#c0c' }, {});
            //     this.getWhiteKeys().setStyle({ backgroundColor:'#fef' }, {});
            // },
            })
            .or(function(){ alert('Cannot open KeyBoard!\n' + this.err()); })

        let thru = JZZ.Widget({ _receive: function(msg) {
            this.emit(msg);
            if (is_correct() && GlobalVar.chord_timerid == null) {
                clearInterval(GlobalVar.timerid);
                document.getElementById("chord").style.color = "blue";
                document.getElementById("time").style.color = "blue";
                GlobalVar.chord_timerid = setTimeout(
                    function(){
                        print_chord(PlayingChordList.next());
                        GlobalVar.chord_timerid = null;
                        document.getElementById("chord").style.color = "";
                        document.getElementById("time").style.color = "";
                    }
                    , 1000
                );
            }
        }});

        this.input = default_in_midi;
        this.kbd=kbd;
        this.thru=thru;
        this.output = default_out_midi;

        default_in_midi.connect(kbd);
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
            selectMidiOut[2].selected = 1;
            // if (!i) {
            //     selectMidiOut[i] = new Option('Not available');
            // }
            for (i = 0; i < this.info().inputs.length; i++) {
                let reverse_idx = this.info().inputs.length-i-1;
                selectMidiIn[i] = new Option(this.info().inputs[reverse_idx].name);
            }
            selectMidiIn[i-1].selected = 1;
            
            //selectMidiIn[i] = new Option('HTML Piano');
            //selectMidiIn[i].selected = 1;

            selectMidiIn.addEventListener('change', MIDICtrl.changeMidiIn);
            selectMidiOut.addEventListener('change', MIDICtrl.changeMidiOut);
        }).and(function() {
            MIDICtrl.changeMidiOut();
            MIDICtrl.changeMidiIn();
        });

        //JZZ.addMidiOut('MIDIjs', MIDICtrl.midijs);
    }

    static playing_notes() {
        let notes = MIDICtrl.kbd.getKeys()["piano"].playing;
        let playing_notes = [];
        for (i in notes)
            if (typeof notes[i] != "undefined")
                playing_notes.push(i);
        return playing_notes;
    }
    
    static changeMidiIn() {
        let selectMidiIn = document.getElementById('selectmidiin');
        let name = selectMidiIn.options[selectMidiIn.selectedIndex].value;
        if (name == MIDICtrl.input.name()) return;
        if (MIDICtrl.input) MIDICtrl.input.disconnect(MIDICtrl.kbd);
        // if (name == 'Virtual_in') {
        //     if (midiInPort) midiInPort.close();
        //     midiInPort = piano;
        //     midiInPort.connect(through);
        //     midiInName = name;
        // }
        JZZ().openMidiIn(name).or(MIDICtrl.onMidiInFail).and(MIDICtrl.onMidiInSuccess);
    }

    static changeMidiOut() {
        let selectMidiOut = document.getElementById('selectmidiout');
        let name = selectMidiOut.options[selectMidiOut.selectedIndex].value;
        if (name == MIDICtrl.output.name()) return;
        if (MIDICtrl.output) MIDICtrl.thru.disconnect(MIDICtrl.output);
        
        MIDICtrl.output = JZZ().openMidiOut(name)
            .and(MIDICtrl.onMidiOutSuccess)
            .or(MIDICtrl.onMidiOutFail);
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
        if (MIDICtrl.input && MIDICtrl.input != MIDICtrl.kbd) {
            MIDICtrl.input.close();
        }
        MIDICtrl.input = this;
        this.connect(MIDICtrl.kbd);
        let midiInName = this.name();
        let selectMidiIn = document.getElementById('selectmidiin');
        MIDICtrl.setListbox(selectMidiIn, midiInName);
    }
    
    static onMidiInFail() {
        if (MIDICtrl.input) MIDICtrl.input.connect(MIDICtrl.kbd);
        let selectMidiIn = document.getElementById('selectmidiin');
        let midiInName = this.name();
        MIDICtrl.setListbox(selectMidiIn, midiInName);
    }
  
}