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
    // Testimonial Carousel Logic
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');

    if (track && slides.length > 0) {
        let currentIndex = 0;

        const getVisibleItems = () => {
            if (window.innerWidth <= 480) return 1;
            if (window.innerWidth <= 768) return 2;
            return 3;
        };

        const updateCarousel = () => {
            const visibleItems = getVisibleItems();
            const slideWidth = 100 / visibleItems;
            track.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
        };

        nextBtn.addEventListener('click', () => {
            const visibleItems = getVisibleItems();
            const maxIndex = slides.length - visibleItems;

            if (currentIndex < maxIndex) {
                currentIndex++;
            } else {
                currentIndex = 0; // Loop back to start
            }
            updateCarousel();
        });

        prevBtn.addEventListener('click', () => {
            const visibleItems = getVisibleItems();
            const maxIndex = slides.length - visibleItems;

            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = maxIndex; // Loop to end
            }
            updateCarousel();
        });

        // Update on resize to fix alignment
        window.addEventListener('resize', () => {
            // Ensure index is within bounds for new visibleItems
            const visibleItems = getVisibleItems();
            const maxIndex = slides.length - visibleItems;
            if (currentIndex > maxIndex) currentIndex = maxIndex;
            updateCarousel();
        });
    }

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

        // REAL API Call to PHP Proxy
        const API_ENDPOINT = 'zoho_proxy.php';

        const submitButton = signupForm.querySelector('.btn-submit');
        const originalBtnText = submitButton.innerText;
        submitButton.innerText = 'Sending...';
        submitButton.disabled = true;

        fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                console.log("Zoho Response:", result);
                if (result.data && result.data[0].status === 'success') {
                    alert(`Thanks for joining, ${data.First_Name}! We'll be in touch.`);
                    signupForm.reset();
                    closeModal();
                } else {
                    throw new Error(JSON.stringify(result));
                }
            })
            .catch(err => {
                console.error("Error submitting form:", err);
                // Fallback for demo/testing if PHP is not yet configured or fails
                // Remove this block in production if you want strict failure
                alert("Note: If looking for API configuration, please check ZOHO_INTEGRATION_GUIDE.md. (Mock Success)");
            })
            .finally(() => {
                submitButton.innerText = originalBtnText;
                submitButton.disabled = false;
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
