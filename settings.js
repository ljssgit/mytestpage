class GlobalVar {
    static BPM = 0;
    static VOLUME = 50;
    static major_scale = [2, 2, 1, 2, 2, 2, 1];
    static songs = [];
    static cur_song_idx = -1;
    static timerid = null;
    static chord_timerid = null;
    static next_chord_term = false;
}

Element.prototype.setAttributes = function(obj){ for(var prop in obj) this.setAttribute(prop, obj[prop]) };

class ChordProgress {
    static chord_progress = [
        [
            ["I", "-", "-", "-"],
            ["V/3", "-", "-", "-"],
            ["IV/3", "-", "-", "-"],
            ["I/5", "-", "-", "-"],
            ["IV", "-", "-", "-"],
            ["I/3", "-", "-", "-"],
            ["IIm7", "-", "-", "-"],
            ["V7sus4", "-", "-", "-"],
            ["I", "-", "-", "-"]
        ],
        [
            ["I", "-", "-", "-"],
            ["V/3", "-", "-", "-"],
            ["bVII", "-", "-", "-"],
            ["VIsus4", "VI", "V/3", "bIIdim7"],
            ["IIm7", "-", "V7sus4", "-"],
            ["IIIm7", "-", "VIm7", "-"],
            ["IIm7", "-", "V7(b9)", "-"],
            ["V7sus4", "-", "-", "-"],
            ["I", "-", "-", "-"]
        ],
        [
            ["I", "-", "IIm7", "I/3"],
            ["IVM7", "-", "IV6", "-"],
            ["IIIm7", "-", "VIm7", "-"],
            ["IIm7", "-", "V7sus4", "-"],
            ["Vm7", "-", "I7", "bIIIdim7"],
            ["IVM7", "-", "IV6", "-"],
            ["IIIm7", "-", "VIm7", "-"],
            ["IIm7", "-", "-", "-"],
            ["V7sus4", "-", "-", "-"],
            ["I", "-", "-", "-"],
        ],
        [
            ["I", "-", "-", "-"],
            ["V/3", "-", "-", "-"],
            ["IV/3", "-", "-", "-"],
            ["IIIm/3", "-", "I/5", "-"],
            ["IV", "-", "-", "-"],
            ["IIIm7", "-", "VIm7", "-"],
            ["IIm7", "-", "-", "-"],
            ["V7sus4", "-", "-", "-"],
        ]
    ];
}
