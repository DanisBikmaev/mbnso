function init(elem, options){
    elem.append('<span class="countdownHolder"></span>');
    var container = elem.find('.countdownHolder');

    //container.append('(');
    // Создаем разметку внутри контейнера
    $.each(['Minutes','Seconds'],function(i){
        var title = '';
        if(this == 'Minutes') {
            title = 'Минут';
        } else if(this == 'Seconds') {
            title = 'Секунд';
        }
        $('<span class="count'+this+'" data-title="'+title+'">').html(
            '<span class="position"><span class="digit static">0</span></span>'
            + '<span class="position"><span class="digit static">0</span></span>'
        ).appendTo(container);

        if(this!="Seconds"){
            container.append('<span class="countDiv countDiv'+i+'">:</span>');
        }
    });
    //container.append(')');
}

// Создаем анимированный переход между двумя цифрами
function switchDigit(position,number){

    var digit = position.find('.digit')

    if(digit.is(':animated')){
        return false;
    }

    if(position.data('digit') == number){
        // Мы уже вывели данную цифру
        return false;
    }

    position.data('digit', number);

    var replacement = $('<span>',{
        'class':'digit',
        css:{
            top:'-2.1em',
            opacity:0
        },
        html:number
    });

    // Класс .static добавляется, когда завершается анимация.
    // Выполнение идет более плавно.

    digit
        .before(replacement)
        .removeClass('static')
        .animate({top:'2.5em',opacity:0},'fast',function(){
            digit.remove();
        })

    replacement
        .delay(100)
        .animate({top:0,opacity:1},'fast',function(){
            replacement.addClass('static');
        });
}

(function($){

    // Количество секунд в каждом временном отрезке
    var minutes = 60;

    // Создаем плагин
    $.fn.countdown = function(prop){

        var options = $.extend({
            callback    : function(){},
            timestamp   : 0,
            stopped     : false
        },prop);

        var left, m, s, positions;

        // инициализируем плагин
        init(this, options);

        positions = this.find('.position');

        (function tick(){

            // Осталось времени
            left = Math.floor((options.timestamp - (new Date())) / 1000);

            if(left < 0){
                left = 0;
            }

            // Осталось минут
            m = Math.floor(left / minutes);
            updateDuo(0, 1, m);
            left -= m*minutes;

            // Осталось секунд
            s = left;
            updateDuo(2, 3, s);

            // Вызываем возвратную функцию пользователя
            options.callback(m, s);

            // Планируем следующий вызов данной функции через 1 секунду
            if (m > 0 || s > 0) {
                setTimeout(tick, 1000);
            } else {
                if (!options.stopped) {
                    setTimeout(tick, 1000);
                    options.stopped = true;
                }
            }
        })();

        // Данная функция обновляет две цифровые позиции за один раз
        function updateDuo(minor,major,value){
            switchDigit(positions.eq(minor),Math.floor(value/10)%10);
            switchDigit(positions.eq(major),value%10);
        }

        return this;
    };


    // Здесь размещаются две вспомогательные функции

})(jQuery);
