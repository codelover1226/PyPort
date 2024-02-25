$(document).ready(function() {
$('#phone-number-form').submit(function(e) {
    e.preventDefault();
    $.ajax({
    type: 'POST',
    url: '{{ url_for("request_otp") }}',
    data: {
        phone_number: $('#phone_number').val()
    },
    success: function(response) {
        if (response.success) {
        $('#phone-form').hide();
        $('#otp-form').show();
        } else {
        alert(response.message);
        }
    }
    });
});
});
function redirectToIndex() {
window.location.href = '/';
}