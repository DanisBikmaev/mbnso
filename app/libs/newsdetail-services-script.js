$(document).ready(function(){
	if($('.detail .galery-block .flexslider .item').length)
	{
		$('.detail .galery-block .flexslider .item').sliceHeight({lineheight: -3});
		if($('.detail .galery #carousel').length)
		{
			$('.detail .galery #carousel').flexslider({
				animation: 'slide',
				controlNav: false,
				animationLoop: true,
				slideshow: false,
				itemWidth: 77,
				itemMargin: 7.5,
				minItems: 2,
				maxItems: 4,
				asNavFor: '.detail .galery #slider'
			});
		}
	}
	if($('.docs-block .blocks').length)
		$('.docs-block .blocks .inner-wrapper').sliceHeight({'row': '.blocks', 'item': '.inner-wrapper'});
	if($('.projects.item-views').length)
	{
		$('.projects.item-views .item .image').sliceHeight({lineheight: -3});
		$('.projects.item-views .item').sliceHeight();
	}
});
document.addEventListener('DOMContentLoaded', function() {
    var counter = document.querySelector('#js-indicator-0');
    var counterNumbers;
    var isInited = false;

    if (counter) {
        counterNumbers = counter.querySelectorAll('.indicator__count');

        [].forEach.call(counterNumbers, function(number) {
            number.endValue = parseInt(number.textContent);
            number.innerHTML = '0';
            number.od = new Odometer({
                auto: false,
                duration: 3000,
                el: number,
                value:  0,
                format: '',
                theme: 'minimal'
            });
            number.od.render();
            number.od.update(0);
        });

        window.addEventListener('scroll', function() {
            if (!isInited && window.scrollY + window.innerHeight > counter.offsetTop) {
                setTimeout(function() {
                    [].forEach.call(counterNumbers, function(number) {
                        number.od.update(number.endValue);
                    });
                }, 1200);

                isInited = true;
            }
        });
    }
});