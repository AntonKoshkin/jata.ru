jQuery(document).ready(function($) {
	$('body').on('click', '[data-next-block]', function(event) {
		event.preventDefault();

		var nextBlock = $('#' + $(this).attr('data-next-block'));

		if ($(this).closest('.enter').length) {
			$(this)
				.closest('.enter__page')
				.removeClass('enter__page--show');

			nextBlock.addClass('enter__page--show');
		}
	});
});