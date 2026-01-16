// Booking Page JavaScript

document.addEventListener('DOMContentLoaded', function () {
    console.log('Booking.js initialized');

    // Trip Type Change Logic
    const tripTypeRadios = document.querySelectorAll('input[name="tripType"]');
    const returnDateField = document.getElementById('returnDateGroup');

    if (tripTypeRadios.length > 0 && returnDateField) {
        tripTypeRadios.forEach(radio => {
            radio.addEventListener('change', function () {
                if (this.value === 'oneway') {
                    returnDateField.style.display = 'none';
                } else {
                    returnDateField.style.display = 'flex';
                }
            });
        });
    }

    // Form Submission
    const searchForm = document.getElementById('flightSearchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log('Form submission started');

            // Get form values
            const fromEl = document.getElementById('fromCity');
            const toEl = document.getElementById('toCity');
            const departDateEl = document.getElementById('departureDate');
            const returnDateEl = document.getElementById('returnDateInput');
            const passengersEl = document.getElementById('passengersSelect');
            const classEl = document.getElementById('classSelect');

            const fromVal = fromEl ? fromEl.value : 'Unknown';
            const toVal = toEl ? toEl.value : 'Unknown';

            // Data for API
            const formData = {
                from: fromVal,
                to: toVal,
                departDate: departDateEl ? departDateEl.value : '',
                returnDate: returnDateEl ? returnDateEl.value : null,
                passengers: passengersEl ? passengersEl.value : '1',
                class: classEl ? classEl.options[classEl.selectedIndex].text : 'Economy',
                seatNumber: Math.floor(1 + Math.random() * 30) + String.fromCharCode(65 + Math.floor(Math.random() * 6))
            };

            // Button Loading State
            const submitBtn = searchForm.querySelector('.btn-search-main');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;

            // Send to PHP Backend
            fetch('api/bookings.php?action=create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.pnr) {
                        formData.booking_pnr = data.pnr;
                        localStorage.setItem('recentBooking', JSON.stringify(formData));
                        showSuccessOverlay(fromVal, toVal);
                    } else {
                        alert(data.error || 'Failed to create booking. Please sign in first.');
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }
                })
                .catch(err => {
                    console.error('Booking error:', err);
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
        });
    }

    function showSuccessOverlay(fromVal, toVal) {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        // Create overlay directly in modern JS
        const overlay = document.createElement('div');
        overlay.setAttribute('style', `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    backdrop-filter: blur(10px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    opacity: 0;
                    transition: opacity 0.5s ease;
                `);

        overlay.innerHTML = `
                    <div style="
                        background: white;
                        padding: 50px;
                        border-radius: 30px;
                        text-align: center;
                        color: #1e293b;
                        max-width: 500px;
                        width: 90%;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                        transform: translateY(20px);
                        transition: transform 0.5s ease;
                    ">
                        <i class="fas fa-check-circle" style="font-size: 100px; color: #10b981; margin-bottom: 25px;"></i>
                        <h2 style="font-size: 2rem; color: #1e3a8a; margin-bottom: 15px;">Flight Booked!</h2>
                        <p style="font-size: 1.1rem; color: #64748b; margin-bottom: 25px; line-height: 1.6;">
                            Your flight from <strong>${fromVal}</strong> to <strong>${toVal}</strong> has been successfully booked.
                        </p>
                        <div style="padding: 15px; background: #f1f5f9; border-radius: 12px; margin-bottom: 25px;">
                            <span style="display: block; font-size: 0.9rem; color: #94a3b8;">Redirecting to flight status...</span>
                        </div>
                    </div>
                `;

        document.body.appendChild(overlay);

        // Trigger animations
        setTimeout(() => {
            overlay.style.opacity = '1';
            overlay.firstElementChild.style.transform = 'translateY(0)';
        }, 10);

        // Final redirect
        setTimeout(() => {
            window.location.href = 'flight-status.html';
        }, 3500);
    }
});
