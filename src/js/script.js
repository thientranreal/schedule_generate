//#region class definition
class Time {
    #weekday;
    #class_start;
    #class_end;
    #room_number;
    #is_show;

    constructor() {
        this.#weekday = 'N/A';
        this.#class_start = 'N/A';
        this.#class_end = 'N/A';
        this.#room_number = 'N/A';
        this.#is_show = false;
    }

    //#region getter
    getWeekday() {
        return this.#weekday;
    }
    getClass_start() {
        return this.#class_start;
    }
    getClass_end() {
        return this.#class_end;
    }
    getRoom_number() {
        return this.#room_number;
    }
    getIs_show() {
        return this.#is_show;
    }
    //#endregion

    //#region setter
    setWeekday(weekday) {
        if (weekday < 2 || weekday > 8) {
            return false;
        }
        this.#weekday = weekday;
        return true;
    }
    setClass_start(class_start) {
        if (class_start < 1 || class_start > 10) {
            return false;
        }
        this.#class_start = Number(class_start);
        return true;
    }
    setClass_end(class_end) {
        if (class_end < 1 || class_end > 10) {
            return false;
        }
        this.#class_end = Number(class_end);
        return true;
    }
    setRoom_number(room_number) {
        if (room_number.trim() === '') {
            return false;
        }
        this.#room_number = room_number;
        return true;
    }
    setIs_show(value) {
        if (typeof value === "boolean") {
            this.#is_show = value;
        }
    }
    //#endregion
}

class Subject {
    #subject_title;
    #time_array;

    constructor() {
        this.#subject_title = 'N/A';
        this.#time_array = [];
    }

    //#region setter
    setSubject_title(subject_title) {
        if (subject_title.trim() === '') {
            return false;
        }
        this.#subject_title = subject_title;
        return true;
    }
    setTime_array(time_array) {
        // check if all item in time_array is class Time
        for (let item of time_array) {
            if (!(item instanceof Time)) {
                return false;
            }
        }
        this.#time_array = time_array;
        return true;
    }
    //#endregion

    //#region getter
    getSubject_title() {
        return this.#subject_title;
    }
    getTime_array() {
        return this.#time_array;
    }
    //#endregion

    addTime(time) {
        this.#time_array.push(time);
    }
}
//#endregion

let subjects = [];

$(document).ready(function() {
    let $wrapper = $('#wrapper');

    // check a subject is existed or not
    function subjectExist(subjects, sTitle) {
        let index = -1;
        subjects.some(function(item, index2) {
            if (item.getSubject_title() === sTitle) {
                index = index2;
                return true;
            }
        });
        return index;
    }
    // check class time
    function getArrayTimeOfWeekDay(subjects, weekday) {
        let time_array = [];
        
        for (let item of subjects) {
            for (let time of item.getTime_array()) {
                if (time.getWeekday() === weekday) {
                    time_array.push(time);
                }
            }
        }

        return time_array;
    }
    function checkTrungLich(subjects, time) {
        // get class start, class end time of the week day
        let time_array = getArrayTimeOfWeekDay(subjects, time.getWeekday());
        for (let item of time_array) {
            if (time.getClass_start() >= item.getClass_start() && time.getClass_start() <= item.getClass_end()) {
                return true;
            }
            if (time.getClass_start() < item.getClass_start() && time.getClass_end() >= item.getClass_start()) {
                return true;
            }
        }
        return false;
    }

    // make schedule
    function makeSchedule(time_array, subject_title) {
        let $show_schedule = $wrapper.find('#show_schedule');
        let $col = $show_schedule.find('.col');
        let index, $row, $current_col, margin = 0.2 /*rem*/, height = 3 /*rem*/, new_height;

        for (let time of time_array) {
            // if time is show on schedule then exit
            if (time.getIs_show()) {
                continue;
            }
            // get week day of time then minus 1 for the index of col
            index = time.getWeekday() - 1;
            $current_col = $col.eq(index);
    
            // get row of the current column
            $row = $current_col.find('.row');
            // make the period on schedule disappear
            for (index = time.getClass_start() + 1; index <= time.getClass_end(); index++) {
                $row.eq(index).css({
                    'display' : 'none'
                });
            }

            // make the first row expand over the disappear rows
            index = time.getClass_end() - time.getClass_start() + 1;
            new_height = height * index + margin * (index - 1);
            $row.eq(time.getClass_start()).css({
                'height' : `${new_height}rem`,
                'background-color' : '#8EE4AF',
                'color' : '#05386B'
            }).html(`${subject_title}\nPhòng: ${time.getRoom_number()}`);

            // time is show
            time.setIs_show(true);
        }
    }

    // add click for thêm môn học
    $wrapper.find('#input_button > button[type=button]').on('click', function() {
        //#region query selector
        let $form = $(this).closest('form');
        let $input_field = $form.find('input[type=text');
        let $select = $form.find('select');
        //#endregion
        
        let temp = $input_field.filter('input[id=subject_title]').val().trim();
        // if subject is not existed then create new Subject
        let index = subjectExist(subjects, temp); 
        if (index < 0) {
            let subject = new Subject();
    
            if (!subject.setSubject_title(temp)) {
                alert('Tên môn học không hợp lệ.');
                $input_field.filter('input[id=subject_title]').val('').focus();
                return;
            }
    
            let time = new Time();
            temp = $input_field.filter('input[id=room_number]').val().trim().toUpperCase();
            if (!time.setRoom_number(temp)) {
                alert('Phòng không hợp lệ.');
                $input_field.filter('input[id=room_number]').val('').focus();
                return;
            }
            time.setWeekday($select.filter('select[id=week_day]').val());

            temp = $select.filter('select[id=class_start]').val();
            time.setClass_start(temp);
            
            temp = Number(temp) + Number($select.filter('select[id=duration]').val()) - 1;
            time.setClass_end(temp);
            
            // check time is valid or not
            if(checkTrungLich(subjects, time)) {
                alert('Bị trùng lịch. Không thêm môn học thành công.');
                return;
            }

            // add time for the subject
            subject.addTime(time);

            // add new subject to array
            subjects.push(subject);
        }
        else { // if subject is existed

            let time = new Time();

            temp = $select.filter('select[id=week_day]').val();
            time.setWeekday(temp);

            temp = $select.filter('select[id=class_start]').val();
            time.setClass_start(temp);

            temp = Number(temp) + Number($select.filter('select[id=duration]').val()) - 1;
            time.setClass_end(temp);

            temp = $input_field.filter('input[id=room_number]').val().trim();
            if (!time.setRoom_number(temp)) {
                alert('Phòng không hợp lệ.');
                $input_field.filter('input[id=room_number]').val('').focus();
                return;
            }

            // check time is valid or not
            if (checkTrungLich(subjects, time)) {
                alert('Bị trùng lịch. Không thêm môn học thành công.');
                return;
            }

            subjects[index].addTime(time);
        }
        alert("Thêm môn học thành công.");

        // Generate schedule
        makeSchedule(subjects[subjects.length - 1].getTime_array(), subjects[subjects.length - 1].getSubject_title());
    });
    
});