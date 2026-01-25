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
});
