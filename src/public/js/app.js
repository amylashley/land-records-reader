// Client-side JavaScript for Mass Land Records app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing form controls...');
    
    const form = document.querySelector('form');
    const submitButton = form?.querySelector('button[type="submit"]');
    const grantorRadio = document.getElementById('grantors');
    const granteeRadio = document.getElementById('grantees');
    const grantorPeriodSelect = document.getElementById('grantorPeriod');
    const granteePeriodSelect = document.getElementById('granteePeriod');
    const hiddenIndexType = document.getElementById('indexType');
    
    console.log('Elements found:', {
        grantorRadio: !!grantorRadio,
        granteeRadio: !!granteeRadio,
        grantorPeriodSelect: !!grantorPeriodSelect,
        granteePeriodSelect: !!granteePeriodSelect,
        hiddenIndexType: !!hiddenIndexType
    });
    
    // Function to toggle between grantor and grantee selects
    function toggleRecordType() {
        console.log('toggleRecordType called, grantor checked:', grantorRadio?.checked);
        
        const grantorGroup = document.querySelector('.grantor-group');
        const granteeGroup = document.querySelector('.grantee-group');
        
        console.log('Form groups found:', {
            grantorGroup: !!grantorGroup,
            granteeGroup: !!granteeGroup
        });
        
        if (grantorRadio?.checked) {
            console.log('Showing grantor, hiding grantee');
            if (grantorGroup) grantorGroup.style.display = 'block';
            if (granteeGroup) granteeGroup.style.display = 'none';
            if (grantorPeriodSelect) grantorPeriodSelect.disabled = false;
            if (granteePeriodSelect) {
                granteePeriodSelect.disabled = true;
                granteePeriodSelect.value = '';
            }
        } else if (granteeRadio?.checked) {
            console.log('Showing grantee, hiding grantor');
            if (grantorGroup) grantorGroup.style.display = 'none';
            if (granteeGroup) granteeGroup.style.display = 'block';
            if (granteePeriodSelect) granteePeriodSelect.disabled = false;
            if (grantorPeriodSelect) {
                grantorPeriodSelect.disabled = true;
                grantorPeriodSelect.value = '';
            }
        }
        
        updateHiddenField();
    }
    
    // Function to update the hidden indexType field
    function updateHiddenField() {
        if (!hiddenIndexType) return;
        
        if (grantorRadio?.checked && grantorPeriodSelect?.value) {
            hiddenIndexType.value = grantorPeriodSelect.value;
            console.log('Set hidden field to grantor value:', grantorPeriodSelect.value);
        } else if (granteeRadio?.checked && granteePeriodSelect?.value) {
            hiddenIndexType.value = granteePeriodSelect.value;
            console.log('Set hidden field to grantee value:', granteePeriodSelect.value);
        } else {
            hiddenIndexType.value = '';
            console.log('Cleared hidden field');
        }
    }
    
    // Event listeners for radio buttons
    if (grantorRadio && granteeRadio) {
        grantorRadio.addEventListener('change', function() {
            console.log('Grantor radio changed');
            toggleRecordType();
        });
        
        granteeRadio.addEventListener('change', function() {
            console.log('Grantee radio changed');
            toggleRecordType();
        });
        
        // Initialize the display
        console.log('Initializing display...');
        toggleRecordType();
    } else {
        console.error('Radio buttons not found!');
    }
    
    // Event listeners for select dropdowns
    if (grantorPeriodSelect) {
        grantorPeriodSelect.addEventListener('change', function() {
            console.log('Grantor period changed to:', this.value);
            updateHiddenField();
        });
    }
    
    if (granteePeriodSelect) {
        granteePeriodSelect.addEventListener('change', function() {
            console.log('Grantee period changed to:', this.value);
            updateHiddenField();
        });
    }
    
    if (form && submitButton) {
        form.addEventListener('submit', function(e) {
            // Show loading state
            submitButton.textContent = 'Searching...';
            submitButton.disabled = true;
            
            // Validate form fields
            const county = form.querySelector('#county').value;
            const lastName = form.querySelector('#lastName').value;
            const indexType = hiddenIndexType?.value || '';
            
            console.log('Form validation:', { county, lastName, indexType });
            
            if (!county || !lastName || !indexType) {
                e.preventDefault();
                let message = 'Please fill in all required fields:\n';
                if (!county) message += '- County\n';
                if (!lastName) message += '- Last Name\n';
                if (!indexType) message += '- Time Period\n';
                
                alert(message);
                submitButton.textContent = 'Search Records';
                submitButton.disabled = false;
                return;
            }
            
            // Clean up the last name input
            const lastNameInput = form.querySelector('#lastName');
            if (lastNameInput) {
                lastNameInput.value = lastNameInput.value.trim();
            }
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
