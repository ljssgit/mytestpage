class Note {
    static names = ["C", "C#(Db)", "D", "D#(Eb)", "E", "F", "F#(Gb)", "G", "G#(Ab)", "A", "A#(Bb)", "B"];
    static sharp_names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    static flat_names = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

    //type : 0:names, 1:sharp, 2:flat, 3:random(sharp/flat)
    static num2name(num, type=0) {
        let names = [Note.names, Note.sharp_names, Note.flat_names];
        let rand = parseInt(Math.random()*2);
        names.push(names[rand+1]);

        return names[type][num];
    }

    //name_type : 0:names, 1:sharp, 2:flat, 3:random(sharp/flat)
    static nums2names(nums, type=0) {
        let name_list = [];
        for (let i in nums)
            name_list.push(Note.num2name(nums[i], type));

        return name_list;
    }

    static name2num(name) {
        let num = Note.names.indexOf(name);
        if (num == -1) {
            let idx = Note.names.indexOf(name[0]);
            if(name[1] == "#") num = idx+1;
            else num = idx-1;
        }

        return num;
    }

    static names2nums(names) {
        let num_list = [];
        for (let i in names)
            num_list.push(Note.name2num(names[i]));

        return num_list;
    }

    static key_calc(name, num) {
        let note_num = Note.name2num(name);
        let type = 2;
        if (["A","D","E","G"].indexOf(name) >= 0 || name[1] == "#") type=1;
        let result = Note.num2name((note_num + num) % Note.names.length, type);
        return result;
    }
}

class Chord {
    static nm_list = ["note", "chordtone", "tension", "inversion"];
    static chordtones = ["", "m", "dim", "sus4", "add2", "7", "m7", "M7", "7sus4", "9sus4", "mM7", "dim7", "6", "m6", "m7(b5)"];
    static tensions = ["", "b9", "9", "#9", "11", "#11", "b13", "13"];
    static inversions = ["", "전위"];

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
        //result.push(num); //오른손 근음 포함

        // 코드톤 추가
        for (let i=this.chordtones.length-1;i>=0;i--) {
            let add_name = this.chordtones[i]
            if (chord_nm.indexOf(add_name) > -1) {
                // if      (add_name == ""         )   result = result.concat([(num+3)%12, (num+4)%12             ]);   //슬래시코드는?
                if      (add_name == "m"        )   result = result.concat([(num+3)%12, (num+7)%12             ]);
                else if (add_name == "dim"      )   result = result.concat([(num+3)%12, (num+6)%12             ]);
                // else if (add_name == "sus2"     )   result = result.concat([(num+2)%12, (num+7)%12             ]);   //필요할때 추가
                else if (add_name == "sus4"     )   result = result.concat([(num+5)%12, (num+7)%12             ]);
                else if (add_name == "add2"     )   result = result.concat([(num+2)%12, (num+4)%12, (num+ 7)%12]);
                else if (add_name == "7"        )   result = result.concat([(num+4)%12, (num+7)%12, (num+10)%12]);
                else if (add_name == "m7"       )   result = result.concat([(num+3)%12, (num+7)%12, (num+10)%12]);
                else if (add_name == "M7"       )   result = result.concat([(num+4)%12, (num+7)%12, (num+11)%12]);
                else if (add_name == "7sus4"    )   result = result.concat([(num+5)%12, (num+7)%12, (num+10)%12]);
                else if (add_name == "9sus4"    )   result = result.concat([(num+2)%12, (num+5)%12, (num+10)%12]);  //5음생략
                else if (add_name == "mM7"      )   result = result.concat([(num+3)%12, (num+7)%12, (num+11)%12]);
                else if (add_name == "6"        )   result = result.concat([(num+4)%12, (num+7)%12, (num+ 9)%12]);
                else if (add_name == "m6"       )   result = result.concat([(num+3)%12, (num+7)%12, (num+ 9)%12]);
                else if (add_name == "dim7"     )   result = result.concat([(num+3)%12, (num+6)%12, (num+ 9)%12]);
                else if (add_name == "m7(b5)"   )   result = result.concat([(num+3)%12, (num+6)%12, (num+10)%12]);
                break;
            }
        }
        // 코드 한개짜리
        if (result.length < 3) {
            if(split_nm.length > 1) {   //슬래시코드
                if ((num+4)%12 == result[0]) result.push(num, (num+2)%12, (num+7)%12);
                else if ((num+7)%12 == result[0]) result.push(num, (num+2)%12, (num+4)%12);
                else result.push((num+4)%12, (num+7)%12);
            }
            else result.push((num+4)%12, (num+7)%12);
        }

        // ===== tension 미추가 =====

        // 전위
        // this.inversions.reverse();
        // result.splice(1, 0, result.pop());
        // for (let i in this.inversions) {
        //     if (chord_nm.indexOf(this.inversions[i]) > -1) break;
        //     result.splice(1, 0, result.pop());
        // }
        // this.inversions.reverse();

        return result;
    }

    // ids = [note_ids, add_ids, tension_ids, inversion_ids]
    static rand_chords_generate(ids, size=1) {
        let list = [Note.names, Chord.chordtones, Chord.tensions, Chord.inversions];
        let rand_chords = [];
        for (let arr_idx=0;arr_idx<size;arr_idx++) {
            let chord = "";
            //let chk_ids = [[], [], [], []]
            for (let i=0;i<ids.length-1;i++) {
                if (ids[i].length==0) continue;
                if (i==0) {
                    let rand_idx = Math.random()*ids[i].length;
                    chord = Note.num2name(ids[i][parseInt(rand_idx)], 3);
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

    // num -1:random, -2:random(no default inversion), >0:inversion change num
    static change_inversion(chordtones, inv_settings={num:0, ranges:["F3", "F3"], root_inv:true}) {
        console.log(inv_settings)
        let num = inv_settings.num;
        let ranges = inv_settings.ranges;
        let root_inv = inv_settings.root_inv;
        let root = undefined;
        if (!root_inv) {
            if (chordtones.length > 3) root = chordtones.splice(0,1);
            else if (chordtones.length == 3) root = [chordtones[0]];
        }
        console.log(MIDI.keyToNote[ranges[1]]-MIDI.keyToNote[ranges[0]]);
        if(MIDI.keyToNote[ranges[1]]-MIDI.keyToNote[ranges[0]] < 11) {
            if (num<0) num = (1 + parseInt(Math.random()*(chordtones.length-num-1))) % chordtones.length;
        }
        else {
            let cd_arr = [];
            let ctlen = chordtones.length;
            chordtones.reverse();
            for (let i=0;i<ctlen;i++) {
                chordtones.splice(0, 0, chordtones.pop());
                chordtones.reverse();
                let oct = parseInt(ranges[0][ranges.length-1]);
                if (chordtones[0] < Note.name2num(ranges[0].substring(0, ranges[0].length-1))) oct += 1
                if (chordtones[0] > chordtones[chordtones.length-1]) oct += 1
                if (MIDI.keyToNote[Note.num2name(chordtones[chordtones.length-1], 2)+oct] <= MIDI.keyToNote[ranges[1]])
                    cd_arr.push(i+1);
                
                chordtones.reverse();
            }
            chordtones.reverse();

            num = cd_arr[parseInt(Math.random()*(cd_arr.length))];
        }
        
        chordtones.reverse();
        for (let i=0;i<num;i++) chordtones.splice(0, 0, chordtones.pop());
        chordtones.reverse();

        num = num%chordtones.length;
        if (!root_inv && typeof root != "undefined") chordtones.splice(0,0,root)
        console.log(chordtones)

        return num;
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

    static cur() {
        return this.chords[this.cur_idx];
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

    static isLastN(n) {
        if (this.cur_idx >= this.chords.length-1-n)
            return true;
        return false;
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
                chord += Chord.inversions[parseInt(chord_split[1])];
            
            this.chord_list.push(chord);
        }
    }
}
