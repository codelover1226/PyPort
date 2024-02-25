document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");
    form.onsubmit = function(event) {
      event.preventDefault();
      fetch("{{ url_for('register') }}", {
        method: 'POST',
        body: new FormData(form)
      }).then(response => response.json()).then(data => {
        if (data.success) {
          // Clear the form and display OTP input field
          form.innerHTML = ' < input type = "text" name = "otp" placeholder = "Passwort eingeben" required > ' + ' < button type = "submit" class = "button" > Passwort bestätigen < /button>';
          // Add event listener for OTP submission
          form.onsubmit = function(event) {
            event.preventDefault();
            fetch("{{ url_for('verify_otp') }}", {
              method: 'POST',
              body: new FormData(form)
            }).then(response => response.json()).then(data => {
              if (data.success) {
                alert(data.message);
                window.location.href = "{{ url_for('index') }}";
              } else {
                alert(data.message);
              }
            }).catch(error => {});
          };
        } else {
          // Show error message
          alert(data.message);
        }
      }).catch(error => {});
    };
  });

  function validatePhoneNumber(input) {
    // Remove non-numeric characters
    let phoneNumber = input.value.replace(/[^\d]/g, '');
    // Check if the number starts with '43' and its length is more than 13 digits
    if (phoneNumber.startsWith('43') && phoneNumber.length > 15) {
      // Remove the '43' prefix
      phoneNumber = phoneNumber.substring(2);
    }
    // Further limit to 13 digits
    if (phoneNumber.length > 13) {
      phoneNumber = phoneNumber.substring(0, 13);
    }
    // Update the input value
    input.value = phoneNumber;
  }

  function redirectToIndex() {
    window.location.href = '/';
  }

  function redirectToRegister() {
    window.location.href = '/register';
  }