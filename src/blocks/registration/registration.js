jQuery(document).ready(function($) {
	$('body').on('click', '[data-next-block]', function(event) {
		event.preventDefault();

		var nextBlock = $('#' + $(this).attr('data-next-block'));

		if ($(this).attr('data-vared') === 'true') {
			if ($('#regAdverRole').prop('checked')) {
				nextBlock = $('#regAdver');
			}
		}

		if ($(this).closest('.registration').length) {
			$(this)
				.closest('.registration__page')
				.removeClass('registration__page--show');

			nextBlock.addClass('registration__page--show');
		}
	});
});