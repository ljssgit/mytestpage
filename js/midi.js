class MIDI {
    static input;
    static kbd;
    static thru;
    static output;

    constructor(){}

    static init() {
        let in_midi = JZZ.Widget({ _receive: function(msg) { console.log(msg);emit(msg); }});
        JZZ.addMidiIn('Virtual_in', in_midi);

        JZZ.synth.Tiny.register('Web Audio');
        //sizes = [150, 42, 100, 24]
        let sizes = [152, 38, 100, 24]
        let ratio = 0.7
        for (let i in sizes) sizes[i] = sizes[i]*ratio

        let kbd = JZZ.input.Kbd({at:'piano', from:'C3', to:'B5',
            wl:sizes[0], ww:sizes[1], bl:sizes[2], bw:sizes[3],
            0:   { pos: 'W' },
            320: { },
            //450: { to: 'E5' },
            //610: { to: 'B5' },
            650: { to: 'E6' },
            900: { to: 'B6' },
            1200: { from: 'C2' },
            //1200: { to: 'B7' },
            1500: { to: 'B7' },
            // onCreate: function() {
            //     this.getKeys().setStyle({ margin:0, borderColor:'#00f' });
            //     this.getBlackKeys().setStyle({ backgroundColor:'#c0c' }, {});
            //     this.getWhiteKeys().setStyle({ backgroundColor:'#fef' }, {});
            // },
            })
            .or(function(){ alert('Cannot open MIDI In!\n' + this.err()); })

        JZZ().and(function(){
            var i;
            var selectMidiIn = document.getElementById('selectmidiin');
            var selectMidiOut = document.getElementById('selectmidiout');
            for (i = 0; i < this.info().outputs.length; i++) {
                selectMidiOut[i] = new Option(this.info().outputs[i].name);
            }
            if (!i) {
                selectMidiOut[i] = new Option('Not available');
            }
            for (i = 0; i < this.info().inputs.length; i++) {
                selectMidiIn[i] = new Option(this.info().inputs[i].name);
                selectMidiIn[i].selected = 1;
            }
            //selectMidiIn[i] = new Option('HTML Piano');
            //selectMidiIn[i].selected = 1;
        });
            
        // JZZ().openMidiOut().or(MIDI.onMidiOutFail).and(MIDI.onMidiOutSuccess);
        // JZZ().openMidiIn().or(MIDI.onMidiInFail).and(MIDI.onMidiInSuccess);              

        let input = JZZ().openMidiIn();
        let output = JZZ().openMidiOut('Web Audio');//JZZ().openMidiOut();
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
        var name = selectMidiIn.options[selectMidiIn.selectedIndex].value;
        if (name == this.input.name()) return;
        if (input) input.disconnect(kbd);
        // if (name == 'Virtual_in') {
        //     if (midiInPort) midiInPort.close();
        //     midiInPort = piano;
        //     midiInPort.connect(through);
        //     midiInName = name;
        // }
        JZZ().openMidiIn(name).or(MIDI.onMidiInFail).and(MIDI.onMidiInSuccess);
    }

    static changeMidiOut(name) {
        if (name == this.output.name()) return;
        if (this.output) this.thru.disconnect(this.output);
        
        this.output = JZZ().openMidiOut(name).or(MIDI.onMidiOutFail).and(MIDI.onMidiOutSuccess);
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
        midiOutName = this.name();
        selectMidiOut = document.getElementById('selectmidiin');
        MIDI.setListbox(selectMidiOut, midiOutName);
    }
    
    static onMidiOutFail() {
        if (MIDI.output) MIDI.thru.connect(MIDI.output);
        midiOutName = this.name();
        selectMidiOut = document.getElementById('selectmidiin');
        MIDI.setListbox(selectMidiOut, midiOutName);
    }
    
    static onMidiInSuccess() {
        if (MIDI.input && MIDI.input != MIDI.kbd) {
            midiInPort.close();
        }
        midiInPort = this;
        this.connect(MIDI.kbd);
        midiInName = this.name();
        selectMidiOut = document.getElementById('selectmidiin');
        MIDI.setListbox(selectMidiIn, midiInName);
    }
    
    static onMidiInFail() {
        if (MIDI.input) MIDI.input.connect(MIDI.kbd);
        MIDI.setListbox(selectMidiIn, midiInName);
    }
  
}
