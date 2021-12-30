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

        let kbd = JZZ.input.Kbd({at:'piano', from:'C3', to:'B3',
            wl:sizes[0], ww:sizes[1], bl:sizes[2], bw:sizes[3],
            0:   { pos: 'W' },
            320: { },
            450: { to: 'E5' },
            610: { to: 'B5' },
            650: { to: 'E6' },
            900: { to: 'B6' },
            1200: { to: 'B7' },
            1500: { to: 'B8' },
            // onCreate: function() {
            //     this.getKeys().setStyle({ margin:0, borderColor:'#00f' });
            //     this.getBlackKeys().setStyle({ backgroundColor:'#c0c' }, {});
            //     this.getWhiteKeys().setStyle({ backgroundColor:'#fef' }, {});
            // },
            })
            .or(function(){ alert('Cannot open MIDI In!\n' + this.err()); })

        JZZ().or('Cannot start MIDI engine!')
            .openMidiOut().or('Cannot open MIDI Out port!')
            .and(function() { console.log('MIDI-In: ', this.name()); })
        JZZ().openMidiIn().or('Cannot open MIDI In port!')
            .and(function() { console.log('MIDI-In: ', this.name()); })

        let input = JZZ().openMidiIn();
        let output = JZZ().openMidiOut();
        let thru = JZZ.Widget({ _receive: function(msg) { this.emit(msg);is_correct(); }});

        input.connect(kbd);
        kbd.connect(thru);
        thru.connect(output);

        this.input=input;
        this.kbd=kbd;
        this.thru=thru;
        this.output=output;
    }

    static playing_notes() {
        let notes = MIDI.kbd.getKeys()["piano"].playing;
        let playing_notes = [];
        for (i in notes)
            if (typeof notes[i] != "undefined")
                playing_notes.push(i);
        return playing_notes;
    }
}