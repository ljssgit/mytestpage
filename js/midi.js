class MIDI {
    static input;
    static kbd;
    static thru;
    static output;

    constructor(){}

    static init() {
        let default_in_midi = JZZ.Widget({ _receive: function(msg) { this.emit(msg); }});
        let default_out_midi = JZZ.Widget({ _receive: function(msg) { this.emit(msg); }});
        let synth_name = "Web Audio";

        JZZ.addMidiIn('None', default_in_midi);
        JZZ.synth.Tiny.register(synth_name);
        JZZ.addMidiOut('None', default_out_midi);

        //sizes = [150, 42, 100, 24]
        let sizes = [152, 38, 100, 24]
        let ratio = 0.7
        for (let i in sizes) sizes[i] = sizes[i]*ratio;

        let kbd = JZZ.input.Kbd({at:'piano', from:'C3', to:'B5',
            wl:sizes[0], ww:sizes[1], bl:sizes[2], bw:sizes[3],
            0:   { pos: 'W' },
            320: { },
            // 450: { to: 'E5' },
            // 610: { to: 'B5' },
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

        JZZ().and(function(){
            let i;
            let selectMidiIn = document.getElementById('selectmidiin');
            let selectMidiOut = document.getElementById('selectmidiout');
            
            for (i = 0; i < this.info().outputs.length; i++) {
                let reverse_idx = this.info().outputs.length-i-1;
                selectMidiOut[i] = new Option(this.info().outputs[reverse_idx].name);
            }
            selectMidiOut[1].selected = 1;
            if (!i) {
                selectMidiOut[i] = new Option('Not available');
            }
            for (i = 0; i < this.info().inputs.length; i++) {
                let reverse_idx = this.info().inputs.length-i-1;
                selectMidiIn[i] = new Option(this.info().inputs[reverse_idx].name);
            }
            selectMidiIn[i-1].selected = 1;
            
            //selectMidiIn[i] = new Option('HTML Piano');
            //selectMidiIn[i].selected = 1;

            selectMidiIn.addEventListener('change', MIDI.changeMidiIn);
            selectMidiOut.addEventListener('change', MIDI.changeMidiOut);
        });
            
        // JZZ().openMidiOut().or(MIDI.onMidiOutFail).and(MIDI.onMidiOutSuccess);
        // JZZ().openMidiIn().or(MIDI.onMidiInFail).and(MIDI.onMidiInSuccess);              

        let input = JZZ().openMidiIn();
        let output = JZZ().openMidiOut(synth_name);//JZZ().openMidiOut();
        let thru = JZZ.Widget({ _receive: function(msg) {
            this.emit(msg);
            if (is_correct() && GlobalVar.timerid == null) {
                document.getElementById("chord").style.color = "blue";
                GlobalVar.timerid = setTimeout(
                    function(){
                        print_chord(PlayingChordList.next());
                        GlobalVar.timerid = null;
                        document.getElementById("chord").style.color = "";
                    }
                    , 1000
                );
            }
        }});

        input.connect(kbd);
        kbd.connect(thru);
        thru.connect(output);

        this.input=input;
        this.kbd=kbd;
        this.thru=thru;
        this.output=output;

        // this.changeMidiOut("Web Audio");
        // thru.connect(output);
    }

    static playing_notes() {
        let notes = MIDI.kbd.getKeys()["piano"].playing;
        let playing_notes = [];
        for (i in notes)
            if (typeof notes[i] != "undefined")
                playing_notes.push(i);
        return playing_notes;
    }

    // static changeMidiIn(name) {
    //     var name = selectMidiIn.options[selectMidiIn.selectedIndex].value;
    //     if (name == midiInName) return;
    //     if (midiInPort) midiInPort.disconnect(through);
    //     if (name == 'HTML Piano') {
    //     if (midiInPort) midiInPort.close();
    //     midiInPort = piano;
    //     midiInPort.connect(through);
    //     midiInName = name;
    //     }
    //     else JZZ().openMidiIn(name).or(onMidiInFail).and(onMidiInSuccess);
    // }
    
    static changeMidiIn() {
        let selectMidiIn = document.getElementById('selectmidiin');
        let name = selectMidiIn.options[selectMidiIn.selectedIndex].value;
        if (name == MIDI.input.name()) return;
        if (MIDI.input) MIDI.input.disconnect(MIDI.kbd);
        // if (name == 'Virtual_in') {
        //     if (midiInPort) midiInPort.close();
        //     midiInPort = piano;
        //     midiInPort.connect(through);
        //     midiInName = name;
        // }
        JZZ().openMidiIn(name).or(MIDI.onMidiInFail).and(MIDI.onMidiInSuccess);
    }

    static changeMidiOut() {
        var selectMidiOut = document.getElementById('selectmidiout');
        var name = selectMidiOut.options[selectMidiOut.selectedIndex].value;
        if (name == MIDI.output.name()) return;
        if (MIDI.output) MIDI.thru.disconnect(MIDI.output);
        
        MIDI.output = JZZ().openMidiOut(name).or(MIDI.onMidiOutFail).and(MIDI.onMidiOutSuccess);
    }
    
    static setListbox(lb, s) {
        for (var i = 0; i < lb.options.length; i++) if (lb.options[i].value == s) lb.options[i].selected = 1;
    }

    static onMidiOutSuccess() {
        if (MIDI.output) {
            MIDI.output.close();
        }
        MIDI.output = this;
        MIDI.thru.connect(this);
        let midiOutName = this.name();
        let selectMidiOut = document.getElementById('selectmidiout');
        MIDI.setListbox(selectMidiOut, midiOutName);
    }
    
    static onMidiOutFail() {
        if (MIDI.output) MIDI.thru.connect(MIDI.output);
        let midiOutName = this.name();
        let selectMidiOut = document.getElementById('selectmidiout');
        MIDI.setListbox(selectMidiOut, midiOutName);
    }
    
    static onMidiInSuccess() {
        if (MIDI.input && MIDI.input != MIDI.kbd) {
            MIDI.input.close();
        }
        MIDI.input = this;
        this.connect(MIDI.kbd);
        let midiInName = this.name();
        let selectMidiIn = document.getElementById('selectmidiin');
        MIDI.setListbox(selectMidiIn, midiInName);
    }
    
    static onMidiInFail() {
        if (MIDI.input) MIDI.input.connect(MIDI.kbd);
        let selectMidiIn = document.getElementById('selectmidiin');
        let midiInName = this.name();
        MIDI.setListbox(selectMidiIn, midiInName);
    }
  
}