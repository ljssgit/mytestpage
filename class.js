let timerid = null;

class Note {
    static names = ["C", "C#(Db)", "D", "D#(Eb)", "E", "F", "F#(Gb)", "G", "G#(Ab)", "A", "A#(Bb)", "B"];

    static num2name(num) {
        if (num instanceof Array) {
            let name_list = []
            for (let i in num)
                name_list.push(Note.names[num[i]]);

            return name_list;
        }

        return Note.names[num];
    }

    static name2num(name) {
        if(typeof name == "string") {
            let num = Note.names.indexOf(name);
            if (num == -1 && name.length > 1) {
                let idx = Note.names.indexOf(name[0]);
                if(name[1] == "#") num = idx+1;
                else num = idx-1;
            }
            return num;
        }

        return name;

    }
}

class Chord {
    static chordtones = ["", "7", "m7", "M7", "mM7", "7sus4",  "dim7", "m6", "m7(b5)"];
    static tensions = ["", "b9", "9", "#9", "b11", "11", "#11", "b13", "13", "#13"];
    static forms = ["", " [1전위]", " [2전위]"];

    constructor() {}

    static chordtone(chord_nm) {
        let result = [];

        let split_nm = chord_nm.split(" [")[0].split("/");
        let num = -1;
        // 근음 추가
        if (split_nm.length > 1) {   //슬래시코드
            split_nm = split_nm[1];
            if (split_nm.length > 1 && (split_nm[1] == "#" || split_nm[1] == "b"))
                num = Note.name2num(split_nm.substr(0,2));
            else num = Note.name2num(split_nm[0]);
            result.push(num);
        }
        if (chord_nm.length > 1 && (chord_nm[1] == "#" || chord_nm[1] == "b"))
            num = Note.name2num(chord_nm.substr(0,2));
        else num = Note.name2num(chord_nm[0]);
        result.push(num);

        // 코드톤 추가
        for (let i=this.chordtones.length-1;i>=0;i--) {
            let add_name = this.chordtones[i]
            if (chord_nm.indexOf(add_name) > -1) {
                if      (add_name == "7"     )  result = result.concat([(num+4)%12, (num+7)%12, (num+10)%12]);
                else if (add_name == "m7"    )  result = result.concat([(num+3)%12, (num+7)%12, (num+10)%12]);
                else if (add_name == "M7"    )  result = result.concat([(num+4)%12, (num+7)%12, (num+11)%12]);
                else if (add_name == "mM7"   )  result = result.concat([(num+3)%12, (num+7)%12, (num+11)%12]);
                else if (add_name == "7sus4" )  result = result.concat([(num+5)%12, (num+7)%12, (num+10)%12]);
                else if (add_name == "m6"    )  result = result.concat([(num+3)%12, (num+7)%12, (num+ 9)%12]);
                else if (add_name == "dim7"  )  result = result.concat([(num+3)%12, (num+6)%12, (num+ 9)%12]);
                else if (add_name == "m7(b5)")  result = result.concat([(num+3)%12, (num+6)%12, (num+10)%12]);
                break;
            }
        }
        // 코드 한개짜리 tension 추가
        if (result.length < 3) {
            if(split_nm.length > 1) {
                if ((num+4)%12 == result[0]) result.push((num+2)%12, (num+7)%12);
                else result.push((num+4)%12, (num+7)%12);
            }
            else result.push((num+2)%12, (num+4)%12, (num+7)%12);
        }

        // ===== tension 미추가 =====

        // 전위
        this.forms.reverse();
        result.splice(1, 0, result.pop());
        for (let i in this.forms) {
            if (chord_nm.indexOf(this.forms[i]) > -1) break;
            result.splice(1, 0, result.pop());
        }
        this.forms.reverse();

        return result;
    }

    // ids = [note_ids, add_ids, tension_ids, form_ids]
    static rand_chords_generate(ids, size=1) {
        let list = [Note.names, Chord.chordtones, Chord.tensions, Chord.forms]
        let rand_chords = [];
        for (let arr_idx=0;arr_idx<size;arr_idx++) {
            let chord = "";
            //let chk_ids = [[], [], [], []]
            for (let i in ids) {
                if (ids[i].length==0) continue;
                if (i==0) {
                    let rand_idx = Math.random()*ids[i].length;
                    chord = list[i][ids[i][parseInt(rand_idx)]];
                    
                    if (chord.length > 1 && chord[1] == "#") {
                        if (Math.random() < 0.5)
                            chord = chord.substr(0,2);
                        else
                            chord = chord.substr(3,2);
                    }
                }
                else {
                    // let rand_idx = Math.random()*(ids[i].length+1);
                    // if (parseInt(rand_idx) < ids[i].length)
                    //     chord += list[i][ids[i][parseInt(rand_idx)]];
                    let rand_idx = Math.random()*(ids[i].length);
                    chord += list[i][ids[i][parseInt(rand_idx)]];
                }
            }

            rand_chords.push(chord);
        }

        return rand_chords;
    }
}

class PlayingChordList {
    static chords = [];
    static cur_idx = 0;

    constructor(chord_list) {
        this.chords = chord_list;
        this.cur_idx = -1;
    }

    static setChords(chord_list, i=-1) {
        this.chords = chord_list;
        this.cur_idx = i;
    }

    static setIdx(i) {
        this.cur_idx = i;
    }

    static next() {
        if (this.cur_idx < this.chords.length)
            this.cur_idx++;
        //else cur_idx=0;
        return this.chords[this.cur_idx];
    }

    static prev() {
        if (this.cur_idx > 0)
            this.cur_idx--;
        //else cur_idx = chords.length-1;
        return this.chords[this.cur_idx];
    }

    static goFirst() {
        this.cur_idx = 0;
        return this.chords[this.cur_idx];
    }

    static isLast() {
        if (this.cur_idx >= this.chords.length-1)
            return true;
        return false;
    }
}

class Piano {
    static piano_object = null;
    static keys = [];
    static sounds = [];
    static selected_keys = [];
    static key_size = [135, 21, 85, 11];
    static piano_octave = [2, 3, 4];

    static make_keys(piano_obj) {
        for (let i in this.piano_octave) {
            for (let j in Note.names) {
                let key = document.createElement("div");
                let id = Note.names[j]+this.piano_octave[i]
                key.setAttribute("id", id);
                if(Note.names[j].length == 1) {
                    key.setAttribute("class", "white_key");
                    piano_obj.appendChild(key);
                }
                else {
                    key.setAttribute("class", "black_key");
                    piano_obj.lastChild.appendChild(key);
                }
                this.keys.push(id);
            }
            this.piano_object = piano_obj;
        }

        for (let i in this.keys) {
            let fnm = this.keys[i].replace(/\#\(.*\)/, "-").toLowerCase();
            //let sound = new Audio("files/"+fnm+".ogg");
            let sound = new Audio("https://raw.githubusercontent.com/ljssgit/mytestpage/main/files/"+fnm+".ogg");
            sound.loop=false;
            this.sounds.push(sound);
        }
    }

    //건반 크기 조정
    static set_piano_size(ratio) {
        //key_size = [135, 21, 85, 10];

        changecss(".white_key", "height",(this.key_size[0]*ratio)+"px");
        changecss(".white_key", "width",(this.key_size[1]*ratio)+"px");
        changecss(".black_key", "height",(this.key_size[2]*ratio)+"px");
        changecss(".black_key", "width",(this.key_size[3]*ratio)+"px");
        changecss(".black_key", "left",((this.key_size[1]-this.key_size[3]*0.5)*ratio+1)+"px");
    }

    static clear_piano() {
        for (let i in this.selected_keys) {
            let element = document.getElementById(this.selected_keys[i]);
            element.className = element.className.replace(/ selected_root_key| selected_key/, "");
            element.style.backgroundColor = "";
            this.play_sound(this.selected_keys[i], false);
        }

        this.selected_keys = [];
        // for(i in this.piano_octave) {
        //     let oct = this.piano_octave[i];
        //     for(i in Note.names) {
        //         let class_name = document.getElementById(Note.names[i]+oct).className.split(" ");
        //         if (class_name.length > 1)
        //             document.getElementById(Note.names[i]+oct).className = class_name[0];
        //     }
        // }
    }

    static mark_piano(chordtone) {
        this.clear_piano();
        let ct = [];
        let oct = this.piano_octave[0];
        ct.push(Note.names[chordtone[0]]+oct);
        oct = 4; //oct++;
        for (let i=1;i<chordtone.length;i++) {
            if (chordtone[i-1] > chordtone[i]) oct++;
            if (oct > this.piano_octave[this.piano_octave.length-1]) {
                oct--;
                for (j=1;j<i;j++)
                    ct[j] = ct[j].substr(0,ct[j].length-1)+(parseInt(ct[j][ct[j].length-1])-1);
            }
            ct.push(Note.names[chordtone[i]]+oct);
        }
        //console.log(ct.toString());
        this.key_select(ct[0], true);
        for (let i=1;i<ct.length;i++)
            this.key_select(ct[i], false);
    }
    
    static key_select(key_id, is_root) {
        if (key_id == "piano") return;
        //console.log(key_id + " select");
        let key_element = document.getElementById(key_id);
        let selected_idx = this.selected_keys.indexOf(key_id);
        if (selected_idx >= 0) {
            key_element.className = key_element.className.replace(/ selected_root_key| selected_key/, "");
            this.selected_keys.splice(selected_idx, 1);

            this.play_sound(key_id, false);
        }
        else {
            let class_name;
            if (is_root) class_name = " selected_root_key";
            else class_name = " selected_key";
            key_element.className += class_name;
            this.selected_keys.push(key_id);

            this.play_sound(key_id, true);
        }
    }

    static play_sound(key_id, flag) {
        let sound = this.sounds[this.keys.indexOf(key_id)];
        if (flag) {
            sound.currentTime = 0;
            sound.volume = VOLUME/100;
            sound.play();

            let fadePoint = 1;
            sound.fadeAudio = setTimeout(
                function fade() {
                    // Only fade if past the fade out point or not at zero already
                    if (sound.volume > 0.0) {
                        if (sound.volume < 0.1*VOLUME/100) sound.volume = 0.0;
                        else sound.volume -= 0.1*VOLUME/100;
                    }
                    // When volume at zero stop all the intervalling
                    if (sound.volume == 0.0 || sound.paused) {
                        sound.pause();
                        clearTimeout(sound.fadeAudio);
                    }
                    else {
                        sound.fadeAudio = setTimeout(fade, 200);
                    }
                }
                , fadePoint*1000);
        }
        else {
            sound.pause();
            clearTimeout(sound.fadeAudio);
        }
    }
}

class SheetMusic {
    chord_list = [];
    is_playing = false;

    constructor(chord_list) {
        for (let i in chord_list) {
            if (!(chord_list[i][0] >= "A" && chord_list[i][0] <= "G")) {
                this.chord_list.push(this.chord_list[this.chord_list.length-1]);
                continue;
            }
            
            let chord_split = chord_list[i].split(".");
            let chord = chord_split[0];
            if (chord_split.length > 1)
                chord += Chord.forms[parseInt(chord_split[1])];
            
            this.chord_list.push(chord);
        }
    }

    // play() {
    //     let tick = 1000*60/BPM;
    //     this.is_playing = true;
    //     document.getElementById("music_btn").innerText = "stop";

    //     clearTimeout(timerid);

    //     let cd_list = this.chord_list;
    //     timerid = setTimeout(
    //         function timer(idx) {
    //             console.log(idx);
    //             if (idx < cd_list.length) {
    //                 print_chord(cd_list[idx], true);
    //                 setTimeout(timer, tick, idx+1);
    //             }
    //         }
    //         , 0
    //         , 0
    //     );
    // }

    // stop() {
    //     clearTimeout(timerid);
    //     this.is_playing = false;
    //     document.getElementById("music_btn").innerText = "start";
    // }
}