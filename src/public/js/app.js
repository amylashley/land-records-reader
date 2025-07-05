// Client-side JavaScript for Mass Land Records app
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const submitButton = form?.querySelector('button[type="submit"]');
    
    if (form && submitButton) {
        form.addEventListener('submit', function(e) {
            // Show loading state
            submitButton.textContent = 'Searching...';
            submitButton.disabled = true;
            
            // Validate form fields
            const county = form.querySelector('#county').value;
            const lastName = form.querySelector('#lastName').value;
            const indexType = form.querySelector('#indexType').value;
            
            if (!county || !lastName || !indexType) {
                e.preventDefault();
                alert('Please fill in all required fields');
                submitButton.textContent = 'Search Records';
                submitButton.disabled = false;
                return;
            }
            
            // Clean up the last name input
            const lastNameInput = form.querySelector('#lastName');
            lastNameInput.value = lastNameInput.value.trim();
        });
    }
    
    // Add some interactive features
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
});
