class GlobalVar {
    static BPM = 0;
    static VOLUME = 50;
    static MODE = 1;
    static major_scale = [2, 2, 1, 2, 2, 2, 1];
    static songs = [];
    static cur_song_idx = -1;
    static timerid = null;
    static chord_timerid = null;
}

Element.prototype.setAttributes = function(obj){ for(var prop in obj) this.setAttribute(prop, obj[prop]) };