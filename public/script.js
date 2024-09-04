function showNextSection(nextSectionId) {
    const currentSection = document.querySelector('.form-section:not([style*="display: none"])');
    const nextSection = document.getElementById(nextSectionId);

    if (validateSection(currentSection)) {
        currentSection.style.display = 'none';
        nextSection.style.display = 'block';
    }
}

function showPreviousSection(prevSectionId) {
    const currentSection = document.querySelector('.form-section:not([style*="display: none"])');
    const prevSection = document.getElementById(prevSectionId);

    currentSection.style.display = 'none';
    prevSection.style.display = 'block';
}

function validateSection(section) {
    let isValid = true;
    const inputs = section.querySelectorAll('input[required], textarea[required]');
    
    inputs.forEach(input => {
        if (!input.checkValidity()) {
            isValid = false;
            input.reportValidity();
        }
        // Additional validation for specific fields
        if (input.type === 'text' && input.name.includes('PinCode')) {
            isValid = validatePinCode(input) && isValid;
        } else if (input.type === 'tel') {
            isValid = validatePhoneNumber(input) && isValid;
        } else if (input.type === 'email') {
            isValid = validateEmail(input) && isValid;
        } else if (input.type === 'number' && input.name === 'itemWeight') {
            isValid = validateWeight(input) && isValid;
        }
    });

    return isValid;
}

function validatePinCode(input) {
    const pinCode = input.value;
    const isValid = /^\d{6}$/.test(pinCode); // Assuming a 6-digit pin code
    if (!isValid) {
        input.setCustomValidity("Invalid pin code. Must be exactly 6 digits.");
        input.reportValidity();
    } else {
        input.setCustomValidity(""); // Reset custom validity
    }
    return isValid;
}

function validatePhoneNumber(input) {
    const phoneNumber = input.value;
    const isValid = /^\d{10}$/.test(phoneNumber); // Assuming a 10-digit phone number
    if (!isValid) {
        input.setCustomValidity("Invalid phone number. Must be exactly 10 digits.");
        input.reportValidity();
    } else {
        input.setCustomValidity(""); // Reset custom validity
    }
    return isValid;
}

function validateEmail(input) {
    // Using built-in validity check for email
    return input.checkValidity();
}

function validateWeight(input) {
    const weight = parseFloat(input.value);
    const isValid = weight >= 0 && weight <= 100;
    if (!isValid) {
        input.setCustomValidity("Invalid weight. Must be between 0 and 100.");
        input.reportValidity();
    } else {
        input.setCustomValidity(""); // Reset custom validity
    }
    return isValid;
}

document.getElementById('logisticsForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission
    if (validateSection(document.getElementById('item-details'))) {
        // Collect form data
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                window.location.href = `/confirmation.html?bookingId=${result._id}`; // Redirect to confirmation page with booking ID
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});



