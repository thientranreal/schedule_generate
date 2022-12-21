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
        let index, $row, new_height;

        // get height, margin from current size
        $row = getComputedStyle(document.querySelector('.row'));
        let height = Number($row.height.replace('px', ''));
        let margin = Number($row.marginBottom.replace('px', ''));

        for (let time of time_array) {
            // if time is show on schedule then exit
            if (time.getIs_show()) {
                continue;
            }
            // get week day of time then minus 1 for the index of col
            index = time.getWeekday() - 1;
    
            // get row of the current column
            $row = $col.eq(index).find('.row');
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
                'height' : `${new_height}px`,
                'background-color' : '#8EE4AF',
                'color' : '#05386B'
            }).html(`${subject_title}\nPhòng: ${time.getRoom_number()}`);

            // time is show
            time.setIs_show(true);
        }
    }

    // delete subject on schedule
    function deleteSchedule(subject) {
        let $show_schedule = $wrapper.find('#show_schedule');
        let $col = $show_schedule.find('.col');
        let index, $row;

        for (let time of subject.getTime_array()) {
            // get week day of time then minus 1 for the index of col
            index = time.getWeekday() - 1;

            // get row of the current column
            $row = $col.eq(index).find('.row');
            
            // reset inline css for delete subject
            for (index = time.getClass_start(); index <= time.getClass_end(); index++) {
                // delete text
                if (index == time.getClass_start()) {
                    $row.eq(index).html('');
                }
                $row.eq(index).attr('style','');
            }
        }
    }

    // add click for thêm môn học
    $wrapper.find('#input_button > #add_subject').on('click', function() {
        //#region query selector
        let $form = $(this).closest('form');
        let $input_field = $form.find('input[type=text]');
        let $select = $form.find('select');
        //#endregion
        
        let temp = $input_field.filter('input[id=subject_title]').val().trim();
        // if subject is not existed then create new Subject
        let index = subjectExist(subjects, temp);
        let time = new Time();
        if (index < 0) {
            let subject = new Subject();
    
            if (!subject.setSubject_title(temp)) {
                alert('Tên môn học không hợp lệ.');
                $input_field.filter('input[id=subject_title]').val('').focus();
                return;
            }
    
            temp = $input_field.filter('input[id=room_number]').val().trim().toUpperCase();
            if (!time.setRoom_number(temp)) {
                alert('Phòng không hợp lệ.');
                $input_field.filter('input[id=room_number]').val('').focus();
                return;
            }
            time.setWeekday($select.filter('select[id=week_day]').val());

            temp = $select.filter('select[id=class_start]').val();
            if (temp == 10) {
                alert('Tiết bắt đầu không hợp lệ.');
                return;
            }
            time.setClass_start(temp);
            
            temp = Number(temp) + Number($select.filter('select[id=duration]').val()) - 1;
            if(!time.setClass_end(temp)) {
                alert('Tiết kết thúc không hợp lệ.');
                return;
            }

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

            temp = $select.filter('select[id=week_day]').val();
            time.setWeekday(temp);

            temp = $select.filter('select[id=class_start]').val();
            if (temp == 10) {
                alert('Tiết bắt đầu không hợp lệ.');
                return;
            }
            time.setClass_start(temp);

            temp = Number(temp) + Number($select.filter('select[id=duration]').val()) - 1;
            if(!time.setClass_end(temp)) {
                alert('Tiết kết thúc không hợp lệ.');
                return;
            }

            temp = $input_field.filter('input[id=room_number]').val().trim().toUpperCase();
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

    // delete subject
    $wrapper.find('#input_button > #delete_subject').on('click', function() {
        //#region query selector
        let $form = $(this).closest('form');
        let $input_field = $form.find('#subject_title');
        //#endregion

        $input_field.val($input_field.val().trim());
        if ($input_field.val() === '') {
            alert('Chưa nhập tên môn học cần xóa.');
            return;
        }

        let index = subjectExist(subjects, $input_field.val());
        if (index < 0) {
            alert('Tên môn học không tồn tại.');
            return;
        }
        else {
            // xóa trên thời khóa biểu
            deleteSchedule(subjects[index]);
            // xóa phần tử mà tìm thấy
            subjects.splice(index, 1);
            alert('Xóa môn học thành công.');
        }
    });

    // edit subject
    // $wrapper.find('#input_button > #edit_subject').on('click', function() {
    //     //#region query selector
    //     let $form = $(this).closest('form');
    //     let $input_field = $form.find('input[type=text]');
    //     let $select = $form.find('select');
    //     //#endregion

    //     let flag = true;
    //     // trim input and check error
    //     $input_field.each(function() {
    //         $(this).val($(this).val().trim());

    //         // check chuoi rong
    //         if ($(this).val() == '') {
    //             flag = false;
    //             if ($(this).is('#subject_title')) {
    //                 alert('Chưa nhập tên môn học cần sửa.');
    //             }
    //             if ($(this).is('#room_number')) {
    //                 alert('Chưa nhập số phòng cần sửa.');
    //             }
    //         }
    //     });
        
    //     // input is valid
    //     if (flag) {
    //         // get index of subject want to edit
    //         flag = subjectExist(subjects, $input_field.filter('#subject_title').val());

    //         // not exist
    //         if (flag < 0) {
    //             alert('Tên môn học không tồn tại.');
    //             return;
    //         }
            
    //         // create new time
    //         let time = new Time();
    //         time.setWeekday($select.filter('#week_day'));
    //         time.setClass_start($select.filter('#class_start'));
    //         time.setClass_end(time.getClass_start() + Number($select.filter('#duration').val()) - 1);

    //         // nếu bị trùng lịch thì không sửa thành công
    //         if(checkTrungLich(subjects, time)) {
    //             alert(`Bị trùng lịch. Không sửa được môn ${$input_field.filter('#subject_title').val()}`);
    //             return;
    //         }


    //     }

    // });
    

    // add event search box
    $wrapper.find('#subject_title').on('input propertychange', function() {
        let list_subject = '', $search_box = $(this).siblings('#search_box');
        let $subject_title = $(this);
        
        for (let sub of subjects) {
            if (sub.getSubject_title().substring(0, $(this).val().length) === $(this).val()) {
                list_subject += `<li>${sub.getSubject_title()}</li>`
            }
        }

        // remove click event if have any
        $search_box.children().unbind('click');

        // pour list subject to search_box
        $search_box.html(list_subject);

        // add click event for li
        $search_box.children().on('click', function() {
            $subject_title.val($(this).html());
        });
    });

    // close search box
    $wrapper.click(function() {
        $(this)
            .find('#search_box').children().unbind('click')
            .parent().html('');
    });
});