document.addEventListener('DOMContentLoaded', () => {
    // FAQ Accordion Logic
    const questions = document.querySelectorAll('.faq-question');

    questions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isActive = item.classList.contains('active');

            // Close all other items
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle the clicked item
            // If it was active, it removes it (closes). If not, it adds it (opens).
            item.classList.toggle('active');
        });
    });

    console.log("Lobster Search scripts loaded");
    // Step Cards Logic
    const steps = document.querySelectorAll('.step-card');
    const circles = document.querySelectorAll('.num-circle');
    let currentStep = 0;
    const stepInterval = 3000; // 3 seconds per step

    function updateSteps(index) {
        // Remove active class from all
        steps.forEach(step => step.classList.remove('active'));
        circles.forEach(circle => circle.classList.remove('active'));

        // Activate current
        if (steps[index]) steps[index].classList.add('active');
        if (circles[index]) circles[index].classList.add('active');
    }

    function nextStep() {
        currentStep = (currentStep + 1) % steps.length;
        updateSteps(currentStep);
    }

    // Initialize (Start at 0)
    updateSteps(currentStep);

    // Auto-play
    let rotationInterval = setInterval(nextStep, stepInterval);

    // Click handlers for manual navigation
    circles.forEach((circle, index) => {
        circle.addEventListener('click', () => {
            clearInterval(rotationInterval); // Pause auto-play
            currentStep = index;
            updateSteps(currentStep);

            // Restart auto-play
            rotationInterval = setInterval(nextStep, stepInterval);
        });
    });

    // Signup Modal Logic
    const modal = document.getElementById('signupModal');
    const closeBtn = modal.querySelector('.close-btn');
    const signupForm = document.getElementById('signupForm');

    // Select all signup/join buttons
    // Select all signup/join buttons (Exclude specific Instagram button)
    const triggerBtns = document.querySelectorAll('.btn-signup, .btn-footer-signup');

    // Instagram Redirect
    const instagramBtn = document.getElementById('instagramBtn');
    if (instagramBtn) {
        instagramBtn.addEventListener('click', () => {
            // Open in new tab
            window.open('https://www.instagram.com/lobstersearch/?hl=en', '_blank');
        });
    }

    // Open Modal
    triggerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
            // Small timeout to allow display:flex to apply before adding show class for transition
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        });
    });

    // Close Modal Function
    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // Wait for transition
    };

    // Close on X click
    closeBtn.addEventListener('click', closeModal);

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Form Submission & Zoho CRM Integration (Mock)
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Basic Validation (HTML5 'required' handles most)
        const phone = document.getElementById('phone').value;
        if (phone.length < 10) {
            alert('Please enter a valid phone number.');
            return;
        }

        // Gather Data
        const formData = new FormData(signupForm);
        const data = Object.fromEntries(formData.entries());

        // Add timestamp
        const now = new Date().toISOString();
        data.Created_Time = now;
        // Combine Phone + Code
        const fullPhone = `${data.Country_Code} ${data.Phone}`;
        data.Phone = fullPhone;

        console.log("Submitting to Zoho CRM...", data);

        // MOCK API Call
        // Replace 'YOUR_ZOHO_API_ENDPOINT' with actual URL in production
        const API_ENDPOINT = 'https://mock-api.zoho.com/crm/v2/Leads';

        // Simulate Network Request
        new Promise((resolve) => setTimeout(resolve, 1000))
            .then(() => {
                console.log("Success: Data sent to Zoho CRM", data);
                alert(`Thanks for joining, ${data.First_Name}! We'll be in touch.`);
                signupForm.reset();
                closeModal();
            })
            .catch(err => {
                console.error("Error submitting form:", err);
                alert("Something went wrong. Please try again.");
            });
    });

    // Video Modal Logic
    const videoModal = document.getElementById('videoModal');
    const videoCloseBtn = document.querySelector('.video-close');
    const videoElement = document.getElementById('testimonialVideo');
    const polaroids = document.querySelectorAll('.polaroid');

    polaroids.forEach(card => {
        card.addEventListener('click', () => {
            const videoSrc = card.getAttribute('data-video');
            if (videoSrc) {
                videoElement.src = videoSrc;
                videoModal.style.display = 'flex';
                setTimeout(() => {
                    videoModal.classList.add('show');
                    videoElement.play();
                }, 10);
            }
        });
    });

    const closeVideoModal = () => {
        videoElement.pause();
        videoElement.currentTime = 0;
        videoModal.classList.remove('show');
        setTimeout(() => {
            videoModal.style.display = 'none';
            videoElement.src = ''; // Clear source to stop buffering
        }, 300);
    };

    if (videoCloseBtn) {
        videoCloseBtn.addEventListener('click', closeVideoModal);
    }

    window.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });

});
